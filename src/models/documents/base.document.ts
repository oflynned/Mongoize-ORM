import Schema, {IBaseModel} from "../schema/schema.model";
import Logger from "../../logger";
import MongoClient from "../../persistence/mongo.client";
import MemoryClient from "../../persistence/memory.client";

interface IBaseDocument {
    onPreValidate(): void;

    onPostValidate(): void;

    onPreSave(): void;

    onPostSave(): void;

    onPreDelete(): void;

    onPostDelete(): void;
}

interface ISchema<T, S extends Schema<T>> {
    joiSchema(): S;

    toJson(): T | IBaseModel;
}

type IDeletionParams = {
    hard: boolean;
    cascade: boolean;
}

type Client = MongoClient | MemoryClient;

// TODO pseudo-relational data, ie type relations (1-n, n-1, n-n)

abstract class BaseDocument<T, S extends Schema<T>> implements IBaseDocument, ISchema<T, S> {
    protected record: T | IBaseModel | any;

    constructor() {
    }

    static async count<T extends BaseDocument<any, any>, S extends Schema<T>>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        query: object = {}
    ): Promise<number> {
        const records = await client.read(new ChildModelClass().collection(), query);
        return records.length || 0;
    }

    static async deleteCollection<T extends BaseDocument<any, any>, S extends Schema<T>>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
    ): Promise<void> {
        await client.dropCollection(new ChildModelClass().collection());
    }

    static async deleteMany<T extends BaseDocument<any, any>, S extends Schema<T>>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        query: object = {}
    ): Promise<void> {
        const model = new ChildModelClass();
        const recordsToBeDeleted = (await client.read(model.collection(), query)) as Array<T & IBaseModel>;
        const idsToBeDeleted = recordsToBeDeleted.length > 0 ? recordsToBeDeleted.map((record) => record._id) : [];
        await Promise.all(idsToBeDeleted.map((_id) => client.delete(model.collection(), _id)));
    }

    static async deleteOne<T extends BaseDocument<any, any>, S extends Schema<T>>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        query: object = {}
    ): Promise<void> {
        const model = new ChildModelClass();
        const recordsToBeDeleted = (await client.read(model.collection(), query)) as Array<T & IBaseModel>;
        const idToBeDeleted = recordsToBeDeleted.length > 0 ? recordsToBeDeleted[0]._id : undefined;
        await client.delete(model.collection(), idToBeDeleted);
    }

    static async findMany<T extends BaseDocument<any, any>, S extends Schema<T>>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        query: object = {}
    ): Promise<BaseDocument<T, S>[]> {
        const records = await client.read(new ChildModelClass().collection(), query);
        return records.map((record: object) => record as BaseDocument<T, S>)
    }

    static async findOne<T extends BaseDocument<T, S>, S extends Schema<T>>(
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

    static async findOneAndDelete<T extends BaseDocument<any, any>, S extends Schema<T>>(
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

    static async findOneAndUpdate<T extends BaseDocument<any, any>, S extends Schema<T>>(
        ChildModelClass: { new(...args: any[]): T },
        client: Client,
        payload: object,
        query: object
    ): Promise<any> {
        const records = await client.read(new ChildModelClass().collection(), query) as Array<T & IBaseModel>;
        if (records.length > 0) {
            await records[0].update(payload);
        }

        return undefined;
    }

    collection(): string {
        return this.constructor.name.toLowerCase() + "s";
    }

    abstract joiSchema(): S;

    build(payload: T): BaseDocument<T, S> {
        this.record = {...this.joiSchema().baseSchemaContent(), ...payload};
        return this;
    }

    async validate(): Promise<T | IBaseModel> {
        Logger.debug("validate()");

        await this.onPreValidate();
        Logger.debug("validating...");
        const v = await this.joiSchema().validate(this.record);
        await this.onPostValidate();

        return v;
    }

    async update(newPayload: Partial<T>): Promise<BaseDocument<T, S>> {
        Logger.debug("update()");

        // FIXME this is really bad for consistency, we're updating prematurely and rolling back on fail
        //       perhaps run a validation on a specific payload deep clone?
        const oldPayload = {...this.record};
        try {
            this.record = {...this.record, ...newPayload, updatedAt: new Date()};
            await this.validate();
        } catch {
            this.record = {...oldPayload};
        }

        return this;
    }

    async delete(params: Partial<IDeletionParams> = {hard: false, cascade: false}): Promise<void> {
        Logger.debug("delete()");
        const {hard, cascade} = params;
        if (hard) {
            this.record = undefined
            // TODO if cascaded, then also ripple the deletion to relations
        } else {
            const deletionFields = {deleted: true, deletedAt: new Date()};
            this.record = {...this.record, ...deletionFields} as T | IBaseModel
        }
    }

    async onPostDelete(): Promise<void> {
        Logger.debug("onPostDelete")
    }

    async onPostSave(): Promise<void> {
        Logger.debug("onPostSave")
    }

    async onPostValidate(): Promise<void> {
        Logger.debug("onPostValidate")
    }

    async onPreDelete(): Promise<void> {
        Logger.debug("onPreDelete")
    }

    async onPreSave(): Promise<void> {
        Logger.debug("onPreSave")
    }

    async onPreValidate(): Promise<void> {
        Logger.debug("onPreValidate")
    }

    toJson(): T & IBaseModel {
        return this.record as T & IBaseModel;
    }

    async save(client: Client): Promise<BaseDocument<T, S>> {
        const validatedPayload = await this.validate();
        Logger.debug("save()");
        await this.onPreSave();
        Logger.debug("saving...");

        this.record = await client.create(this.collection(), validatedPayload as object) as T & IBaseModel;
        await this.onPostSave();
        return this;
    }
}

export default BaseDocument;
