import {ConnectionOptions, ConnectionValidator} from "./connection.validator";
import Schema from "../models/schema/schema.model";

interface IDatabaseOperation<T> {
    save(collection: string, payload: T): Promise<void>;

    findOne(collection: string): Promise<T>;

    findMany(collection: string): Promise<T[]>;

    findOneAndUpdate(collection: string): Promise<T>;

    findOneAndDelete(collection: string): Promise<void>;

    count(collection: string, query: object): Promise<number>;

    deleteCollection(collection: string): Promise<void>;

    deleteOne(collection: string, query: object): Promise<void>;

    deleteMany(collection: string, query: object): Promise<void>;

    clearCollection(collection: string): Promise<void>;

    dropDatabase(): Promise<void>;

    connect(): Promise<void>;

    close(): Promise<void>;
}

abstract class DatabaseClient<T, S extends Schema<T>> implements IDatabaseOperation<T> {
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

    async clearCollection(collection: string):Promise<void>{
        return undefined;
    }

    async close(): Promise<void> {
        return undefined;
    }

    async count(collection: string, query: object): Promise<number> {
        return 0;
    }

    async deleteCollection(collection: string): Promise<void> {
        return undefined;
    }

    async deleteMany(collection: string, query: object): Promise<void> {
        return undefined;
    }

    async deleteOne(collection: string, query: object): Promise<void> {
        return undefined;
    }

    async dropDatabase(): Promise<void> {
        return undefined;
    }

    async findMany(collection: string): Promise<T[]> {
        return [];
    }

    async findOne(collection: string): Promise<T> {
        return undefined;
    }

    async findOneAndDelete(collection: string): Promise<void> {
        return undefined;
    }

    async findOneAndUpdate(collection: string): Promise<T> {
        return undefined;
    }

    async save(collection: string, payload: T): Promise<void> {
        return undefined;
    }
}

export default DatabaseClient;
