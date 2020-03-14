import {ConnectionOptions, ConnectionValidator} from "./connection.validator";

interface IClientOperation {
    connect(): Promise<DatabaseClient>;

    create(collection: string, payload: object): Promise<object>;

    read(collection: string, query: object): Promise<object[]>;

    update(collection: string, _id: string, payload: object): Promise<object>;

    delete(collection: string, _id: string): Promise<void>;

    dropDatabase(): Promise<void>;

    dropCollection(collection: string): Promise<void>;

    close(): Promise<DatabaseClient>;
}

abstract class DatabaseClient implements IClientOperation {
    abstract async close(): Promise<DatabaseClient>;

    abstract async connect(): Promise<DatabaseClient>;

    abstract async create(collection: string, payload: object): Promise<object>;

    abstract async delete(collection: string, _id: string): Promise<void>;

    abstract async dropCollection(collection: string): Promise<void>;

    abstract async dropDatabase(): Promise<void>;

    abstract async read(collection: string, query: object): Promise<object[]>;

    abstract async update(collection: string, _id: string, payload: object): Promise<object>;

    uri: string;
    database: string;
    options: ConnectionOptions;
    validator: ConnectionValidator;

    protected constructor(options: ConnectionOptions) {
        this.options = options;
        this.validator = new ConnectionValidator();
        const {uri, database} = this.validator.validate(this.options);
    }
}

export default DatabaseClient;
