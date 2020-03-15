import Schema from "../schema/schema.model";
import BaseDocument from "./base.document";
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

  async deleteMany(client: DatabaseClient, query: object = {}): Promise<void> {
    await client.deleteMany(this.instanceType.collection(), query);
  }

  async deleteOne(client: DatabaseClient, _id: string): Promise<void> {
    await client.deleteOne(this.instanceType.collection(), _id);
  }

  async findOne(client: DatabaseClient, query: object): Promise<T> {
    const records = await client.read(this.instanceType.collection(), query);
    console.log(records);
    if (records.length > 0) {
      return Repository.newInstance(this.instanceType).from(records[0]);
    }

    return undefined;
  }

  async findById(client: DatabaseClient, _id: string): Promise<T> {
    return this.findOne(client, { _id });
  }

  async updateOne(
    client: DatabaseClient,
    _id: string,
    updatedFields: object
  ): Promise<T> {
    await client.updateOne(this.instanceType.collection(), _id, updatedFields);
    return this.findOne(client, { _id });
  }

  async findMany(client: DatabaseClient, query: object = {}): Promise<T[]> {
    const records = await client.read(this.instanceType.collection(), query);
    return records.map(
      (record: T) => Repository.newInstance(this.instanceType).from(record) as T
    );
  }

  private static newInstance<T extends BaseDocument<T, S>, S extends Schema<T>>(
    instance: T
  ): T {
    return new (instance.constructor as { new (): T })();
  }
}

export default Repository;
