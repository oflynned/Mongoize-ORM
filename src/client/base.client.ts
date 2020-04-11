import {
  ConnectionOptions,
  ConnectionValidator
} from "./connection-validator";

export abstract class DatabaseClient {
  validator: ConnectionValidator;

  constructor() {
    this.validator = new ConnectionValidator();
  }

  abstract async close(): Promise<void>;

  async connect(options?: ConnectionOptions): Promise<DatabaseClient> {
    this.validator.validate(options);
    return this;
  }

  abstract async create(collection: string, payload: object): Promise<object>;

  abstract async deleteOne(collection: string, _id: string): Promise<number>;

  abstract async deleteMany(collection: string, query: object): Promise<number>;

  abstract async dropCollection(collection: string): Promise<void>;

  abstract async dropDatabase(): Promise<void>;

  abstract async read(collection: string, query: object): Promise<object[]>;

  abstract async updateOne(
    collection: string,
    _id: string,
    payload: object
  ): Promise<object>;

  abstract async count(collection: string, query: object): Promise<number>;
}

export default DatabaseClient;
