import Schema from "../schema/schema.model";
import BaseDocument, { IDeletionParams } from "./base.document";
import DatabaseClient from "../../persistence/base.client";

class Repository<T extends BaseDocument<any, any>, S extends Schema<T>> {
  private instanceType: T;

  private constructor(instance: T) {
    this.instanceType = instance;
  }

  static with<
    T extends BaseDocument<any, any>,
    S extends Schema<T>
  >(ChildModelClass: { new (...args: any[]): T }): Repository<T, S> {
    return new Repository<T, S>(new ChildModelClass());
  }

  async count(client: DatabaseClient, query: object = {}): Promise<number> {
    return client.count(this.instanceType.collection(), query);
  }

  async deleteCollection(client: DatabaseClient): Promise<void> {
    await client.dropCollection(this.instanceType.collection());
  }

  async deleteMany(
    client: DatabaseClient,
    query: object = {},
    params: IDeletionParams = { hard: false }
  ): Promise<T[]> {
    if (params.hard) {
      await client.deleteMany(this.instanceType.collection(), query);
      return [];
    }

    const records = await this.findMany(client, query);
    return await Promise.all(
      records.map(async (record: T) =>
        this.updateOne(client, record.toJson()._id, {
          deletedAt: new Date(),
          deleted: true
        })
      )
    );
  }

  async deleteOne(
    client: DatabaseClient,
    _id: string,
    params: IDeletionParams = { hard: false }
  ): Promise<T | undefined> {
    if (await this.exists(client, _id)) {
      if (params.hard) {
        await client.deleteOne(this.instanceType.collection(), _id);
        return undefined;
      }

      return this.updateOne(client, _id, {
        deletedAt: new Date(),
        deleted: true
      });
    }

    return undefined;
  }

  async findOne(client: DatabaseClient, query: object): Promise<T | undefined> {
    const records = await client.read(this.instanceType.collection(), query);
    if (records.length > 0) {
      return Repository.newInstance(this.instanceType).from(records[0]);
    }

    return undefined;
  }

  async findById(client: DatabaseClient, _id: string): Promise<T> {
    return this.findOne(client, { _id });
  }

  async exists(client: DatabaseClient, _id: string): Promise<boolean> {
    return (await this.count(client, { _id })) > 0;
  }

  async updateOne(
    client: DatabaseClient,
    _id: string,
    updatedFields: object
  ): Promise<T> {
    if (await this.exists(client, _id)) {
      await client.updateOne(
        this.instanceType.collection(),
        _id,
        updatedFields
      );
      return this.findById(client, _id);
    }

    return undefined;
  }

  async findMany(client: DatabaseClient, query: object = {}): Promise<T[]> {
    const records = await client.read(this.instanceType.collection(), query);
    return records.map(
      (record: object) =>
        Repository.newInstance(this.instanceType).from(record) as T
    );
  }

  private static newInstance<T extends BaseDocument<T, S>, S extends Schema<T>>(
    instance: T
  ): T {
    return new (instance.constructor as { new (): T })();
  }
}

export default Repository;
