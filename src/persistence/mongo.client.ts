import DatabaseClient from "./base.client";
import {ConnectionOptions} from "./connection.validator";

class MongoClient extends DatabaseClient {
    constructor(options: ConnectionOptions) {
        super(options);
    }

    async connect(): Promise<void> {

    }
}

export default MongoClient;
