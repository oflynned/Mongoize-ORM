import DatabaseClient from "./base.client";
import {ConnectionOptions} from "./connection.validator";
import Logger from "../logger";
import {IBaseModel} from "../models/schema/schema.model";

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
        Logger.debug("store ->", this.store);
        return payload;
    }

    async read(collection: string, query: object = {}): Promise<object[]> {
        return this.store[collection];
    }

    async update(collection: string, _id: string, payload: object): Promise<object> {
        const existingRecord = (await this.read(collection)).find((record: IBaseModel) => record._id = _id);
        await this.delete(collection, _id);
        return this.create(collection, {...existingRecord, ...payload});
    }

    async delete(collection: string, _id: string): Promise<void> {
        delete this.store[collection][_id]
    }

    async dropDatabase(): Promise<void> {
        this.store = {};
    }

    async dropCollection(collection: string): Promise<void> {
        this.store[collection] = {};
    }
}

export {ConnectionOptions};

export default MemoryClient;
