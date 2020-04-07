import Schema, { IBaseModel } from "../../schema/schema.model";
import Logger from "../../../logger";
import { MongoClient } from "../../../persistence/client";
import Repository from "../../repository";

export type IDeletionParams = {
  hard: boolean;
};

export type IUpdatableFields<T> = Partial<T>;

export abstract class BaseDocument<T, S extends Schema<T>> {
  protected record: T | IBaseModel | any;

  collection(): string {
    return `${this.constructor.name.toLowerCase()}s`;
  }

  abstract joiSchema(): S;

  from(payload: T | object): BaseDocument<T, S> {
    this.record = { ...payload };
    return this;
  }

  build(payload: T): BaseDocument<T, S> {
    this.record = { ...payload, ...this.joiSchema().baseSchemaContent() };
    return this;
  }

  async populate(): Promise<void> {}

  async validate(): Promise<T | IBaseModel> {
    Logger.debug("validate()");
    await this.onPreValidate();

    Logger.debug("validating...");
    this.record = (await this.joiSchema().validate(this.record)).value;

    await this.onPostValidate();

    return this.record;
  }

  async update(
    client: MongoClient,
    payload: Partial<T>
  ): Promise<BaseDocument<T, S>> {
    Logger.debug("update()");

    if (Object.keys(payload).length === 0) {
      throw new Error("payload is empty");
    }

    this.onPreUpdate();
    await this.joiSchema().validateOnUpdate(payload);

    const newInstance = await Repository.with(
      this.constructor as any
    ).updateOne(client, this.record._id, {
      ...payload,
      updatedAt: new Date()
    } as object);

    this.record = newInstance.record;
    this.onPostUpdate();

    return this;
  }

  async delete(
    client: MongoClient,
    params: IDeletionParams = { hard: false }
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

  toJson(): T & IBaseModel {
    return this.record as T & IBaseModel;
  }

  async save(client: MongoClient): Promise<BaseDocument<T, S> | any> {
    const validatedPayload = await this.validate();
    Logger.debug("save()");
    await this.onPreSave();
    Logger.debug("saving...");

    this.record = (await client.create(
      this.collection(),
      validatedPayload as object
    )) as T & IBaseModel;
    await this.onPostSave();
    return this;
  }
}
