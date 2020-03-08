import DatabaseClient from "./base.client";
import {ConnectionOptions} from "./connection.validator";
import Schema from "../models/schema/schema.model";

class MongoClient<T, S extends Schema<T>> extends DatabaseClient<T, S> {
    constructor(options: ConnectionOptions) {
        super(options);
    }

    async connect(): Promise<void> {
        return super.connect();
    }
}

export default MongoClient;
