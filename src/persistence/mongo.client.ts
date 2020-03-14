import DatabaseClient from "./base.client";
import {ConnectionOptions} from "./connection.validator";
import Mongo, {MongoClientOptions} from 'mongodb';

class MongoClient extends DatabaseClient {
    private client: Mongo.MongoClient;

    constructor(options: ConnectionOptions) {
        super(options);
    }

    async create(collection: string, payload: object): Promise<object> {
        await this.client.db(this.database()).collection(collection).insertOne(payload);
        return payload;
    }

    async delete(collection: string, _id: string): Promise<void> {
        return undefined;
    }

    async dropCollection(collection: string): Promise<void> {
        return undefined;
    }

    async dropDatabase(): Promise<void> {
        return undefined;
    }

    async read(collection: string, query: object): Promise<object[]> {
        return undefined;
    }

    async update(collection: string, _id: string, payload: object): Promise<object> {
        return undefined;
    }

    async connect(): Promise<MongoClient> {
        this.client = await Mongo.MongoClient.connect(this.validator.options.uri, this.mongoOptions());
        return this;
    }

    async close(): Promise<MongoClient> {
        await this.client.close();
        return this;
    }

    mongoOptions(): MongoClientOptions {
        return {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }

    database(): string {
        return this.validator.options.database;
    }
}

export {ConnectionOptions};

export default MongoClient;
