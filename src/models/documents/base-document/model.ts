import Schema, {
  BaseModelType,
  BaseRelationshipType,
  InternalModelType
} from "./schema";
import Logger from "../../../logger";
import { MongoClient } from "../../../persistence/client";
import Repository from "../../repository";

export type DeletionParams = Partial<{
  hard: boolean;
}>;

export abstract class BaseDocument<
  Type extends BaseModelType,
  JoiSchema extends Schema<Type>,
  RelationshipSchema extends BaseRelationshipType
> {
  protected record: (Type & InternalModelType) | any;
  protected relationships: RelationshipSchema | any;

  collection(): string {
    return `${this.constructor.name.toLowerCase()}s`;
  }

  abstract joiSchema(): JoiSchema;

  get _id(): string | undefined {
    return this.toJson()._id;
  }

  get createdAt(): Date | undefined {
    return this.toJson().createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.toJson().updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this.toJson().deletedAt;
  }

  get deleted(): boolean {
    return this.toJson().deleted;
  }

  from(
    payload: (Type & InternalModelType) | object
  ): BaseDocument<Type, JoiSchema, RelationshipSchema> {
    this.record = { ...payload };
    return this;
  }

  build(
    payload: Omit<Type, keyof InternalModelType>
  ): BaseDocument<Type, JoiSchema, RelationshipSchema> {
    // TODO parse keys extending BaseDocument to set the record using parseRelationalKey
    //      what about splitting db & document? record needs to be populated after that is dispatched to the db

    this.record = { ...payload, ...this.joiSchema().baseSchemaContent() };
    return this;
  }

  async relationalFields(
    /*eslint-disable */
    client: MongoClient
    /*eslint-enable */
  ): Promise<RelationshipSchema | any> {
    return {};
  }

  async populate(
    client: MongoClient
  ): Promise<BaseDocument<Type, JoiSchema, RelationshipSchema>> {
    this.relationships = { ...(await this.relationalFields(client)) };
    return this;
  }

  async validate(): Promise<Type | InternalModelType> {
    Logger.debug("validate()");
    await this.onPreValidate();

    Logger.debug("validating...");
    const { value, error } = await this.joiSchema().validate(this.record);

    if (error) {
      throw error;
    }

    this.record = value;
    await this.onPostValidate();

    return this.record;
  }

  async update(
    client: MongoClient,
    payload: Partial<Omit<Type, keyof InternalModelType>>
  ): Promise<BaseDocument<Type, JoiSchema, RelationshipSchema>> {
    Logger.debug("update()");

    if (Object.keys(payload).length === 0) {
      throw new Error("payload is empty");
    }

    this.onPreUpdate();
    await this.joiSchema().validateUpdate(payload);

    const newInstance = await Repository.with(
      this.constructor as any
    ).updateOne(
      client,
      this.record._id,
      {
        ...payload,
        updatedAt: new Date()
      } as object,
      // update has already been validated on .validateOnUpdate with Joi
      { validateUpdate: false }
    );

    this.record = newInstance.record;
    this.onPostUpdate();
    return this.populate(client);
  }

  async delete(
    client: MongoClient,
    params: DeletionParams = { hard: false }
  ): Promise<void> {
    this.onPreDelete();
    const newInstance = await Repository.with(
      this.constructor as any
    ).deleteOne(client, this.record._id, params);

    this.record = newInstance ? newInstance.record : undefined;
    this.onPostDelete();
  }

  async onPostDelete(): Promise<void> {
    Logger.debug("onPostDelete");
  }

  async onPostSave(): Promise<void> {
    Logger.debug("onPostSave");
  }

  async onPostValidate(): Promise<void> {
    Logger.debug("onPostValidate");
  }

  async onPreDelete(): Promise<void> {
    Logger.debug("onPreDelete");
  }

  async onPreSave(): Promise<void> {
    Logger.debug("onPreSave");
  }

  async onPreValidate(): Promise<void> {
    Logger.debug("onPreValidate");
  }

  async onPostUpdate(): Promise<void> {
    Logger.debug("onPostUpdate");
  }

  async onPreUpdate(): Promise<void> {
    Logger.debug("onPreUpdate");
  }

  toJson(): Type & InternalModelType {
    return { ...this.record };
  }

  toPopulatedJson(): Type & InternalModelType & RelationshipSchema {
    return { ...this.record, ...this.relationships };
  }

  async save(
    client: MongoClient
  ): Promise<BaseDocument<Type, JoiSchema, RelationshipSchema> | any> {
    const validatedPayload = await this.validate();
    Logger.debug("save()");

    await this.onPreSave();
    Logger.debug("saving...");

    this.record = (await client.create(
      this.collection(),
      validatedPayload as object
    )) as Type & InternalModelType;

    await this.onPostSave();
    return this.populate(client);
  }
}
