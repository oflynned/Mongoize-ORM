import {Connection, ConnectionValidator} from "./connection.validator";

interface IDatabaseOperation {
    save(): void;

    findOne(collection: string): void;

    findMany(collection: string): void;

    findOneAndUpdate(collection: string): void;

    findOneAndDelete(collection: string): void;

    count(collection: string, query: object): void;

    deleteCollection(collection: string): void;

    deleteOne(collection: string, query: object): void;

    deleteMany(collection: string, query: object): void;

    clearCollection(collection: string): void;

    dropDatabase(): void;

    connect(): void;

    close(): void;
}

class DatabaseClient implements IDatabaseOperation {
    connection: Connection;
    validator: ConnectionValidator;

    constructor(connection: Connection) {
        this.connection = connection;
        this.validator = new ConnectionValidator();
    }

    count(collection: string, query: object): void {
    }

    deleteCollection(collection: string): void {
    }

    deleteMany(collection: string, query: object): void {
    }

    deleteOne(collection: string, query: object): void {
    }

    findMany(collection: string): void {
    }

    findOne(collection: string): void {
    }

    findOneAndDelete(collection: string): void {
    }

    findOneAndUpdate(collection: string): void {
    }

    save(): void {
    }

    clearCollection(collection: string) {
    }

    close(): void {
    }

    connect(): void {
        const connectionUri = this.validator.validate(this.connection);
        console.log("connecting", connectionUri);
    }

    dropDatabase() {
    }
}

export default DatabaseClient;
