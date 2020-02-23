import DatabaseClient from "./base.client";
import {ConnectionOptions} from "./connection.validator";

class MemoryClient extends DatabaseClient {
    constructor(options: ConnectionOptions) {
        super(options);
    }
}

export default MemoryClient;
