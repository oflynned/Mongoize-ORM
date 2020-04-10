import Schema, { BaseModelType, InternalModelType } from "./schema";
import Logger from "../../../logger";
import { MongoClient } from "../../../persistence/client";
import Repository from "../../repository";

export type DeletionParams = Partial<{
  hard: boolean;
}>;

type PropertyField = {
  [key: string]: string | number | boolean | object;
};

export abstract class BaseDocument<
  T extends BaseModelType,
  S extends Schema<T>
> {
  protected record: T | InternalModelType | any;

  collection(): string {
    return `${this.constructor.name.toLowerCase()}s`;
  }

  abstract joiSchema(): S;

  from(payload: T | InternalModelType | object): BaseDocument<T, S> {
    this.record = { ...payload };
    return this;
  }

  build(payload: Omit<T, keyof InternalModelType>): BaseDocument<T, S> {
    this.record = { ...payload, ...this.joiSchema().baseSchemaContent() };
    return this;
  }

  // TODO should be used to populate related documents after find/save/update/delete
  async populate(): Promise<void> {}

  pruneUpdateFields(fields: PropertyField): object {
    const updatableKeys = Object.keys(this.joiSchema().joiUpdateSchema());
    const relevantKeys = Object.keys(fields).filter(
      (key: string) => updatableKeys.includes(key),
      []
    );

    const output: PropertyField = {};
    relevantKeys.map((key: string) => {
      output[key] = fields[key];
    });

    if (Object.keys(output).length === 0) {
      throw new Error("invalid update, all keys were pruned");
    }

    return output as object;
  }

  async validate(): Promise<T | InternalModelType> {
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
    payload: Partial<Omit<T, keyof InternalModelType>>
  ): Promise<BaseDocument<T, S>> {
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
      false
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

  toJson(): T & InternalModelType {
    return this.record as T & InternalModelType;
  }

  async save(client: MongoClient): Promise<BaseDocument<T, S> | any> {
    const validatedPayload = await this.validate();
    Logger.debug("save()");
    await this.onPreSave();
    Logger.debug("saving...");

    this.record = (await client.create(
      this.collection(),
      validatedPayload as object
    )) as T & InternalModelType;
    await this.onPostSave();
    return this;
  }
}
