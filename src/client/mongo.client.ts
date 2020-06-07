import Mongo, { Collection, Db, MongoClientOptions } from "mongodb";
import DatabaseClient from "./base.client";
import { ConnectionOptions } from "./connection-validator";

class MongoClient extends DatabaseClient {
  private _client: Mongo.MongoClient;

  async create(collection: string, payload: object): Promise<object> {
    await this.withCollection(collection).insertOne(payload);
    return payload;
  }

  async deleteOne(collection: string, _id: string): Promise<number> {
    const { deletedCount } = await this.withCollection(collection).deleteOne({
      _id
    });
    return deletedCount;
  }

  async deleteMany(collection: string, query: object): Promise<number> {
    const { deletedCount } = await this.withCollection(collection).deleteMany(
      query
    );
    return deletedCount;
  }

  async read(
    collection: string,
    query: object,
    options: { limit?: number; offset?: number; orderBy?: object } = {}
  ): Promise<object[]> {
    const cursor = this.withCollection(collection).find(query, {});
    if (options.orderBy) {
      cursor.sort(options.orderBy);
    }

    if (options.offset) {
      cursor.skip(options.offset);
    }

    if (options.limit) {
      cursor.limit(options.limit);
    }

    return cursor.toArray();
  }

  async dropCollection(collection: string): Promise<void> {
    await this.withCollection(collection).drop();
  }

  async dropDatabase(): Promise<void> {
    await this.withDb().dropDatabase();
  }

  async updateOne(
    collection: string,
    _id: string,
    payload: object
  ): Promise<object> {
    return this.withCollection(collection).updateOne(
      { _id },
      { $set: { ...payload } },
      { upsert: true }
    );
  }

  async connect(options?: ConnectionOptions): Promise<MongoClient> {
    await super.connect(options);
    this._client = await Mongo.MongoClient.connect(
      this.validator.options.uri,
      this.mongoOptions()
    );
    return this;
  }

  async close(): Promise<void> {
    await this._client?.close();
  }

  async count(collection: string, query: object): Promise<number> {
    return this.withCollection(collection).countDocuments(query);
  }

  mongoOptions(): MongoClientOptions {
    return {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
  }

  client(): Mongo.MongoClient {
    return this._client;
  }

  withDb(): Db {
    return this._client.db(this.validator.options.database);
  }

  private withCollection(collection: string): Collection {
    return this.withDb().collection(collection);
  }
}

export { MongoClient, ConnectionOptions };
