import Schema, { BaseModelType, InternalModelType } from "./schema";
import { DatabaseClient } from "../../client";
import Lifecycle from "../lifecycle";
import Repository from "../../repository";

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

  /* eslint-disable */
  async populate(
    client: DatabaseClient = global.databaseClient
  ): Promise<BaseDocument<Type, JoiSchema>> {
    Object.assign(this as any, this.record as Type);
    return this;
  }
  /* eslint-enable */

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

  async validateUpdate(payload: Partial<Type>): Promise<Partial<Type>> {
    const { value, error } = await this.joiSchema().validateUpdate(payload);
    if (error) {
      throw error;
    }

    if (Object.keys(value).length === 0) {
      throw new Error("empty update payload");
    }

    return value;
  }

  async update(
    payload: Partial<Omit<Type, keyof InternalModelType>>,
    client: DatabaseClient = global.databaseClient
  ): Promise<BaseDocument<Type, JoiSchema>> {
    if (Object.keys(payload).length === 0) {
      throw new Error("payload is empty");
    }

    await this.onPreUpdate();
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
    await this.onPostUpdate();
    await this.populate();
    return this;
  }

  async hardDelete(
    client: DatabaseClient = global.databaseClient
  ): Promise<void> {
    await this.onPreDelete();
    const newInstance = await Repository.with(
      this.constructor as any
    ).hardDeleteOne(this.record._id, { client });

    this.record = newInstance ? newInstance.record : undefined;
    await this.onPostDelete();
  }

  async softDelete(
    client: DatabaseClient = global.databaseClient
  ): Promise<void> {
    await this.onPreDelete();
    const newInstance = await Repository.with(
      this.constructor as any
    ).softDeleteOne(this.record._id, { client });

    this.record = newInstance?.record;
    await this.onPostDelete();
  }

  async refresh(
    client: DatabaseClient = global.databaseClient
  ): Promise<BaseDocument<Type, Schema<Type>>> {
    const refreshedInstance = await Repository.with(
      this.constructor as any
    ).findById(this.toJson()._id, { client });
    this.record = refreshedInstance?.record;
    return this;
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
