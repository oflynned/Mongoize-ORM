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

interface ISchema<T, S extends Schema<any>> {
    collection(): string;

    joiSchema(): S;

    toJson(): T | IBaseModel;
}

type IDeletionParams = {
    hard: boolean;
    cascade: boolean;
}

// TODO
//      what about a use case of hashing a password before saving?
//      auto update timestamps on an update being made (CUD)
//      pseudo-relational data, ie type relations (1-n, n-1, n-n)

abstract class BaseDocument<T, S extends Schema<T>> implements IBaseDocument, ISchema<T, S> {
    protected record: T | IBaseModel;
    private client: MemoryClient | MongoClient;

    constructor(client: MemoryClient | MongoClient) {
        this.client = client;
    }

    static clearCollection(): Promise<void> {
        return undefined;
    }

    static count(query: object): Promise<number> {
        return undefined;
    }

    static deleteCollection(): Promise<void> {
        return undefined;
    }

    static deleteMany(query: object): Promise<void> {
        return undefined;
    }

    static deleteOne(query: object): Promise<void> {
        return undefined;
    }

    static findMany(query: object): Promise<any[]> {
        return undefined;
    }

    static findOne(query: object): Promise<any> {
        return;
    }

    static findOneAndDelete(query: object): Promise<void> {
        return undefined;
    }

    static findOneAndUpdate(query: object): Promise<any> {
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

    async validate(): Promise<void> {
        Logger.debug("validate()");

        await this.onPreValidate();
        Logger.debug("validating...");
        await this.joiSchema().validate(this.record);
        await this.onPostValidate();
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

    delete(params: Partial<IDeletionParams> = {hard: false, cascade: false}): void {
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

    onPostDelete(): void {
        Logger.debug("onPostDelete")
    }

    onPostSave(): void {
        Logger.debug("onPostSave")
    }

    onPostValidate(): void {
        Logger.debug("onPostValidate")
    }

    onPreDelete(): void {
        Logger.debug("onPreDelete")
    }

    onPreSave(): void {
        Logger.debug("onPreSave")
    }

    onPreValidate(): void {
        Logger.debug("onPreValidate")
    }

    toJson(): T & IBaseModel {
        return this.record as T & IBaseModel;
    }

    async save(): Promise<BaseDocument<T, S>> {
        await this.validate();

        Logger.debug("save()");
        await this.onPreSave();
        Logger.debug("saving...");
        this.record = await this.client.create(this.collection(), this.record as object) as T & IBaseModel;
        await this.onPostSave();

        return Promise.resolve(this);
    }
}

export default BaseDocument;
