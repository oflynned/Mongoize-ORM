import Schema, { IBaseModel } from "../schema/schema.model";
import Logger from "../../logger";
import MongoClient from "../../persistence/mongo.client";
// import MemoryClient from "../../persistence/memory.client";
import Repository from "./repository";

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

type IDeletionParams = {
  hard: boolean;
};

// type Client = MongoClient | MemoryClient;

abstract class BaseDocument<T, S extends Schema<T>>
  implements IBaseDocument, ISchema<T, S> {
  protected record: T | IBaseModel | any;

  collection(): string {
    return `${this.constructor.name.toLowerCase()}s`;
  }

  abstract joiSchema(): S;

  build(payload: T) {
    this.record = { ...this.joiSchema().baseSchemaContent(), ...payload };
    return this;
  }

  async validate(): Promise<T | IBaseModel> {
    Logger.debug("validate()");

    await this.onPreValidate();

    Logger.debug("validating...");
    this.record = (await this.joiSchema().validate(this.record)) as T &
      IBaseModel;

    await this.onPostValidate();

    return this.record;
  }

  async update(
    client: MongoClient,
    payload: Partial<T>
  ): Promise<BaseDocument<T, S>> {
    Logger.debug("update()");

    if (Object.keys(payload).length === 0) {
      throw new Error("requires defined payload");
    }

    await this.joiSchema().validateOnUpdate(payload);
    this.record = await Repository.updateOne(
      <any>this.constructor,
      client,
      this.record._id,
      { ...payload, updatedAt: new Date() }
    );

    return this;
  }

  async delete(
    client: MongoClient,
    params: Partial<IDeletionParams> = { hard: false }
  ): Promise<void> {
    const { hard } = params;
    if (hard) {
      await Repository.deleteOne(<any>this.constructor, client, {
        _id: this.record._id
      });
      this.record = undefined;
    } else {
      const deletionFields = { deleted: true, deletedAt: new Date() };
      this.record = await Repository.updateOne(
        <any>this.constructor,
        client,
        this.record._id,
        deletionFields
      );
    }
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

  async save(client: MongoClient): Promise<BaseDocument<T, S>> {
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
