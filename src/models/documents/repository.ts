import Schema, {IBaseModel} from "../schema/schema.model";
import BaseDocument from "./base.document";
import DatabaseClient from "../../persistence/base.client";

export class Repository {
    static async count<T extends BaseDocument<any, any>, S extends Schema<T>, Client extends DatabaseClient>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        query: object = {}
    ): Promise<number> {
        const records = await client.read(new ChildModelClass().collection(), query);
        return records.length || 0;
    }

    static async deleteCollection<T extends BaseDocument<any, any>, S extends Schema<T>, Client extends DatabaseClient>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
    ): Promise<void> {
        await client.dropCollection(new ChildModelClass().collection());
    }

    static async deleteMany<T extends BaseDocument<any, any>, S extends Schema<T>, Client extends DatabaseClient>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        query: object = {}
    ): Promise<void> {
        const model = new ChildModelClass();
        const recordsToBeDeleted = (await client.read(model.collection(), query)) as Array<T & IBaseModel>;
        const idsToBeDeleted = recordsToBeDeleted.length > 0 ? recordsToBeDeleted.map((record) => record._id) : [];
        await Promise.all(idsToBeDeleted.map((_id) => client.delete(model.collection(), _id)));
    }

    static async deleteOne<T extends BaseDocument<any, any>, S extends Schema<T>, Client extends DatabaseClient>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        query: object = {}
    ): Promise<void> {
        const model = new ChildModelClass();
        const recordsToBeDeleted = (await client.read(model.collection(), query)) as Array<T & IBaseModel>;
        const idToBeDeleted = recordsToBeDeleted.length > 0 ? recordsToBeDeleted[0]._id : undefined;
        await client.delete(model.collection(), idToBeDeleted);
    }

    static async findMany<T extends BaseDocument<any, any>, S extends Schema<T>, Client extends DatabaseClient>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        query: object = {}
    ): Promise<BaseDocument<T, S>[]> {
        const records = await client.read(new ChildModelClass().collection(), query);
        return records.map((record: object) => record as BaseDocument<T, S>)
    }

    static async findOne<T extends BaseDocument<T, S>, S extends Schema<T>, Client extends DatabaseClient> (
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        query: object
    ): Promise<T> {
        const records = await client.read(new ChildModelClass().collection(), query);
        if (records.length > 0) {
            return records[0] as T;
        }

        return undefined;
    }

    static async findOneAndDelete<T extends BaseDocument<any, any>, S extends Schema<T>, Client extends DatabaseClient>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        query: object
    ): Promise<void> {
        const records = await client.read(new ChildModelClass().collection(), query) as Array<T & IBaseModel>;
        if (records.length > 0) {
            await client.delete(new ChildModelClass().collection(), records[0]._id);
        }

        return undefined;
    }

    static async findOneAndUpdate<T extends BaseDocument<T, S>, S extends Schema<T>, Client extends DatabaseClient>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        payload: object,
        query: object
    ): Promise<any> {
        // const instance = new ChildModelClass().collection();
        // const records = await client.read(instance, query) as Array<T & IBaseModel>;
        // if (records.length > 0) {
        //     await records[0].update(instance, client, payload);
        // }

        return undefined;
    }
}
