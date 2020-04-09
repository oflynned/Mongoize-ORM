import Schema, { IBaseModel, IInternalModel } from "./schema";
import Logger from "../../../logger";
import { MongoClient } from "../../../persistence/client";
import Repository from "../../repository";

export type IDeletionParams = {
  hard: boolean;
};

export abstract class BaseDocument<T extends IBaseModel, S extends Schema<T>> {
  protected record: T | IInternalModel | any;

  collection(): string {
    return `${this.constructor.name.toLowerCase()}s`;
  }

  abstract joiSchema(): S;

  from(payload: T | IInternalModel | object): BaseDocument<T, S> {
    this.record = { ...payload };
    return this;
  }

  build(payload: Omit<T, keyof IInternalModel>): BaseDocument<T, S> {
    this.record = { ...payload, ...this.joiSchema().baseSchemaContent() };
    return this;
  }

  // TODO should be used to populate related documents after find/save/update/delete
  async populate(): Promise<void> {}

  async validate(): Promise<T | IInternalModel> {
    Logger.debug("validate()");
    await this.onPreValidate();

    Logger.debug("validating...");
    this.record = (await this.joiSchema().validate(this.record)).value;

    await this.onPostValidate();

    return this.record;
  }

  async update(
    client: MongoClient,
    payload: Partial<Omit<T, keyof IInternalModel>>
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

  toJson(): T & IInternalModel {
    return this.record as T & IInternalModel;
  }

  async save(client: MongoClient): Promise<BaseDocument<T, S> | any> {
    const validatedPayload = await this.validate();
    Logger.debug("save()");
    await this.onPreSave();
    Logger.debug("saving...");

    this.record = (await client.create(
      this.collection(),
      validatedPayload as object
    )) as T & IInternalModel;
    await this.onPostSave();
    return this;
  }
}
