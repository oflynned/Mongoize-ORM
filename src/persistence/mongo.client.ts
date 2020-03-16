import Mongo, { Collection, Db, MongoClientOptions } from "mongodb";
import DatabaseClient from "./base.client";
import { ConnectionOptions } from "./connection.validator";

class MongoClient extends DatabaseClient {
  private client: Mongo.MongoClient;

  async create(collection: string, payload: object): Promise<object> {
    await this.withCollection(collection).insertOne(payload);
    return payload;
  }

  async deleteOne(collection: string, _id: string): Promise<boolean> {
    const { deletedCount } = await this.withCollection(collection).deleteOne({
      _id
    });
    return deletedCount > 0;
  }

  async deleteMany(collection: string, query: object): Promise<number> {
    const { deletedCount } = await this.withCollection(collection).deleteMany(
      query
    );
    return deletedCount;
  }

  async dropCollection(collection: string): Promise<void> {
    await this.withCollection(collection).drop();
  }

  async dropDatabase(): Promise<void> {
    await this.withDb().dropDatabase();
  }

  async read(collection: string, query: object): Promise<object[]> {
    return this.withCollection(collection)
      .find(query, {})
      .toArray();
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
    this.client = await Mongo.MongoClient.connect(
      options.uri ? options.uri : this.validator.options.uri,
      this.mongoOptions()
    );
    return this;
  }

  async close(): Promise<void> {
    await this.client.close();
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

  private withDb(): Db {
    return this.client.db(this.validator.options.database);
  }

  private withCollection(collection: string): Collection {
    return this.withDb().collection(collection);
  }
}

export { MongoClient, ConnectionOptions };
