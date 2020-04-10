import Schema, { BaseModelType, InternalModelType } from "./schema";
import Logger from "../../../logger";
import { MongoClient } from "../../../persistence/client";
import Repository from "../../repository";
import Lifecycle from "../lifecycle";

export type DeletionParams = Partial<{
  hard: boolean;
}>;

export abstract class BaseDocument<
  Type extends BaseModelType,
  JoiSchema extends Schema<Type>
> extends Lifecycle {
  protected record: Type | InternalModelType | any;

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
  ): BaseDocument<Type, JoiSchema> {
    this.record = { ...payload };
    return this;
  }

  build(
    payload: Omit<Type, keyof InternalModelType>
  ): BaseDocument<Type, JoiSchema> {
    this.record = { ...payload, ...this.joiSchema().baseSchemaContent() };
    return this;
  }

  async validate(): Promise<Type | InternalModelType> {
    await this.onPreValidate();
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
  ): Promise<BaseDocument<Type, JoiSchema>> {
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
    return this;
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

  toJson(): Type & InternalModelType {
    return { ...this.record };
  }

  async save(
    client: MongoClient
  ): Promise<BaseDocument<Type, JoiSchema> | any> {
    const validatedPayload = await this.validate();
    await this.onPreSave();

    this.record = (await client.create(
      this.collection(),
      validatedPayload as object
    )) as Type & InternalModelType;

    await this.onPostSave();
    return this;
  }
}
