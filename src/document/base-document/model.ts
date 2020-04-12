import Schema, { BaseModelType, InternalModelType } from "./schema";
import { DatabaseClient } from "../../client";
import Lifecycle from "../lifecycle";
import Repository, {
  defaultDeleteOptions,
  DeleteOptions
} from "../../repository";

export abstract class BaseDocument<
  Type extends BaseModelType,
  JoiSchema extends Schema<Type>
> extends Lifecycle {
  protected record: Type | InternalModelType | any;

  collection(): string {
    return `${this.constructor.name.toLowerCase()}s`;
  }

  abstract joiSchema(): JoiSchema;

  from(
    payload: (Type & InternalModelType) | object
  ): BaseDocument<Type, JoiSchema> {
    this.record = { ...payload };
    return this;
  }

  build(
    payload: Omit<Type, keyof InternalModelType>
  ): BaseDocument<Type, JoiSchema> {
    this.record = {
      ...payload,
      ...this.joiSchema().baseSchemaContent()
    };
    return this;
  }

  async populate(
    client: DatabaseClient = global.databaseClient
  ): Promise<BaseDocument<Type, JoiSchema>> {
    Object.assign(this as any, this.record as Type);
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
    payload: Partial<Omit<Type, keyof InternalModelType>>,
    client: DatabaseClient = global.databaseClient
  ): Promise<BaseDocument<Type, JoiSchema>> {
    if (Object.keys(payload).length === 0) {
      throw new Error("payload is empty");
    }

    this.onPreUpdate();
    await this.joiSchema().validateUpdate(payload);

    const newInstance = await Repository.with(
      this.constructor as any
    ).updateOne(
      this.record._id,
      {
        ...payload,
        updatedAt: new Date()
      } as object,
      // update has already been validated on .validateOnUpdate with Joi
      { validateUpdate: false, client }
    );

    this.record = newInstance.record;
    this.onPostUpdate();
    await this.populate();
    return this;
  }

  async delete(
    options: DeleteOptions = defaultDeleteOptions,
    client: DatabaseClient = global.databaseClient
  ): Promise<void> {
    this.onPreDelete();
    const newInstance = await Repository.with(
      this.constructor as any
    ).deleteOne(this.record._id, { ...options, client });

    this.record = newInstance ? newInstance.record : undefined;
    this.onPostDelete();
  }

  toJson(): Type & InternalModelType {
    return { ...this.record };
  }

  async save(
    client: DatabaseClient = global.databaseClient
  ): Promise<BaseDocument<Type, JoiSchema> | any> {
    const validatedPayload = await this.validate();
    await this.onPreSave();

    this.record = (await client.create(
      this.collection(),
      validatedPayload as object
    )) as Type & InternalModelType;

    await this.onPostSave();
    await this.populate();
    return this;
  }
}
