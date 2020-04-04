import Schema, { IBaseModel } from "../../schema/schema.model";
import Logger from "../../../logger";
import { InMemoryClient, MongoClient } from "../../../persistence";
import Repository from "../repository/repository";

interface IBaseDocument {
  onPreValidate(): void;

  onPostValidate(): void;

  onPreSave(): void;

  onPostSave(): void;

  onPreUpdate(): void;

  onPostUpdate(): void;

  onPreDelete(): void;

  onPostDelete(): void;
}

interface ISchema<T, S extends Schema<T>> {
  joiSchema(): S;

  toJson(): T | IBaseModel;
}

export type IDeletionParams = {
  hard: boolean;
};

type Client = InMemoryClient | MongoClient;

abstract class BaseDocument<T, S extends Schema<T>>
  implements IBaseDocument, ISchema<T, S> {
  protected record: T | IBaseModel | any;

  collection(): string {
    return `${this.constructor.name.toLowerCase()}s`;
  }

  abstract joiSchema(): S;

  from(payload: T) {
    this.record = { ...payload };
    return this;
  }

  build(payload: T) {
    this.record = { ...payload, ...this.joiSchema().baseSchemaContent() };
    return this;
  }

  async validate(): Promise<T | IBaseModel> {
    Logger.debug("validate()");

    await this.onPreValidate();

    Logger.debug("validating...");
    this.record = (await this.joiSchema().validate(this.record)).value;

    await this.onPostValidate();

    return this.record;
  }

  async update(
    client: Client,
    payload: Partial<T>
  ): Promise<BaseDocument<T, S>> {
    Logger.debug("update()");
    this.onPreUpdate();

    if (Object.keys(payload).length === 0) {
      throw new Error("payload is empty");
    }

    await this.joiSchema().validateOnUpdate(payload);
    const newInstance = await Repository.with(
      <any>this.constructor
    ).updateOne(client, this.record._id, { ...payload, updatedAt: new Date() });

    Object.assign(this, newInstance);
    this.onPostUpdate();

    return this;
  }

  async delete(
    client: Client,
    params: IDeletionParams = { hard: false }
  ): Promise<void> {
    this.onPreDelete();
    const newInstance = await Repository.with(<any>this.constructor).deleteOne(
      client,
      this.record._id,
      params
    );

    this.record = newInstance ? newInstance.record : undefined;

    this.onPostDelete();

    // FIXME undefined not applied to `this` instance
    // Object.assign(this, newInstance);
    // return this;
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
    Logger.debug("onPreValidate");
  }

  toJson(): T & IBaseModel {
    return this.record as T & IBaseModel;
  }

  async save(client: Client): Promise<BaseDocument<T, S> | any> {
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

export default BaseDocument;
