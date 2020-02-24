import {ConnectionOptions, ConnectionValidator} from "./connection.validator";

interface IDatabaseOperation {
    save(): Promise<void>;

    findOne(collection: string): Promise<void>;

    findMany(collection: string): Promise<void>;

    findOneAndUpdate(collection: string): Promise<void>;

    findOneAndDelete(collection: string): Promise<void>;

    count(collection: string, query: object): Promise<void>;

    deleteCollection(collection: string): Promise<void>;

    deleteOne(collection: string, query: object): Promise<void>;

    deleteMany(collection: string, query: object): Promise<void>;

    clearCollection(collection: string): Promise<void>;

    dropDatabase(): Promise<void>;

    connect(): Promise<void>;

    close(): Promise<void>;
}

abstract class DatabaseClient implements IDatabaseOperation {
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

    clearCollection(collection: string):Promise<void>{
        return undefined;
    }

    close(): Promise<void> {
        return undefined;
    }

    count(collection: string, query: object): Promise<void> {
        return undefined;
    }

    deleteCollection(collection: string): Promise<void> {
        return undefined;
    }

    deleteMany(collection: string, query: object): Promise<void> {
        return undefined;
    }

    deleteOne(collection: string, query: object): Promise<void> {
        return undefined;
    }

    dropDatabase(): Promise<void> {
        return undefined;
    }

    findMany(collection: string): Promise<void> {
        return undefined;
    }

    findOne(collection: string): Promise<void> {
        return undefined;
    }

    findOneAndDelete(collection: string): Promise<void> {
        return undefined;
    }

    findOneAndUpdate(collection: string): Promise<void> {
        return undefined;
    }

    save(): Promise<void> {
        return undefined;
    }
}

export default DatabaseClient;
