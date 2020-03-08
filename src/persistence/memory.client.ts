import DatabaseClient from "./base.client";
import {ConnectionOptions} from "./connection.validator";

// TODO replace this with a faux-mongodb interface via npm
//      otherwise it's not possible to pass the same queries
class MemoryClient extends DatabaseClient {
    private store: any = {};

    constructor(options: ConnectionOptions) {
        super(options);
    }

    async create(collection: string, payload: any): Promise<object> {
        if (!Object.getOwnPropertyNames(this.store).includes(collection)) {
            this.store[collection] = [];
        }

        this.store[collection].push(payload);
        console.log("store ->", this.store);
        return this.store[collection].find((item: any) => item._id === payload._id);
    }

    async read(collection: string, query: object): Promise<object[]> {
        return this.store[collection];
    }
}

export {ConnectionOptions};

export default MemoryClient;
