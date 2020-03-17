import { ConnectionOptions, ConnectionValidator } from "./connection.validator";

interface IClientOperation {
  connect(options?: ConnectionOptions): Promise<DatabaseClient>;

  count(collection: string, query: object): Promise<number>;

  create(collection: string, payload: object): Promise<object>;

  read(collection: string, query: object): Promise<object[]>;

  updateOne(collection: string, _id: string, payload: object): Promise<object>;

  deleteOne(collection: string, _id: string): Promise<number>;

  deleteMany(collection: string, query: object): Promise<number>;

  dropDatabase(): Promise<void>;

  dropCollection(collection: string): Promise<void>;

  close(): Promise<void>;
}

abstract class DatabaseClient implements IClientOperation {
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
