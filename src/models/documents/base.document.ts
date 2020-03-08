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

    static async clearCollection(): Promise<void> {
        return undefined;
    }

    static async count(query: object): Promise<number> {
        return undefined;
    }

    static async deleteCollection(): Promise<void> {
        return undefined;
    }

    static async deleteMany(query: object): Promise<void> {
        return undefined;
    }

    static async deleteOne(query: object): Promise<void> {
        return undefined;
    }

    static async findMany<T, S extends Schema<T>>(client: Client, collection: string, query: object = {}): Promise<BaseDocument<T, S>[]> {
        const records = await client.read(collection, query);
        return records.map((record: object) => record as BaseDocument<T, S>)
    }

    static async findOne<T>(query: object): Promise<T> {
        return undefined;
    }

    static async findOneAndDelete(query: object): Promise<void> {
        return undefined;
    }

    static async findOneAndUpdate(query: object): Promise<any> {
        return undefined;
    }

    static collectionName(): string {
        return "";
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

    async save(client: Client, collection: string): Promise<BaseDocument<T, S>> {
        const validatedPayload = await this.validate();
        Logger.debug("save()");
        await this.onPreSave();
        Logger.debug("saving...");

        this.record = await client.create(collection, validatedPayload as object) as T & IBaseModel;
        await this.onPostSave();
        return this;
    }
}

export default BaseDocument;
