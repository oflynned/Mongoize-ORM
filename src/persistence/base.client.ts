import {ConnectionOptions, ConnectionValidator} from "./connection.validator";

interface IClientOperation {
    connect(): Promise<void>;

    create(collection: string, payload: object): Promise<object>;

    read(collection: string, query: object): Promise<object[]>;

    update(collection: string, _id: string, payload: object): Promise<object>;

    delete(collection: string, _id: string): Promise<void>;

    dropDatabase(): Promise<void>;

    dropCollection(collection: string): Promise<void>;

    close(): Promise<void>;
}

abstract class DatabaseClient implements IClientOperation {
    options: ConnectionOptions;
    validator: ConnectionValidator;

    protected constructor(options: ConnectionOptions) {
        this.options = options;
        this.validator = new ConnectionValidator();
    }

    async connect(): Promise<void> {
        const connectionUri = this.validator.validate(this.options);
        console.log("connecting", connectionUri);
    }

    async close(): Promise<void> {
        return undefined;
    }

    async dropDatabase(): Promise<void> {
        return undefined;
    }

    async dropCollection(collection: string): Promise<void> {
        return undefined;
    }

    async create(collection: string, payload: object): Promise<object> {
        return undefined;
    }

    async read(collection: string, query: object): Promise<object[]> {
        return undefined;
    }

    async update(collection: string, _id: string, payload: object): Promise<object> {
        return undefined;
    }

    async delete(collection: string, _id: string): Promise<void> {
        return undefined;
    }
}

export default DatabaseClient;
