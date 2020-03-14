import Schema, {IBaseModel} from "../schema/schema.model";
import Logger from "../../logger";
import MongoClient from "../../persistence/mongo.client";
// import MemoryClient from "../../persistence/memory.client";
import {Repository} from "./repository";

interface IBaseDocument {
    onPreValidate(): void;

    onPostValidate(): void;

    onPreSave(): void;

    onPostSave(): void;

    onPreUpdate(): void;

    onPostUpdate(): void;

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

// type Client = MongoClient | MemoryClient;

// TODO pseudo-relational data, ie type relations (1-n, n-1, n-n)

abstract class BaseDocument<T, S extends Schema<T>> implements IBaseDocument, ISchema<T, S> {
    protected record: T | IBaseModel | any;

    constructor() {
    }

    collection(): string {
        return this.constructor.name.toLowerCase() + "s";
    }

    abstract joiSchema(): S;

    build(payload: T) {
        this.record = {...this.joiSchema().baseSchemaContent(), ...payload};
        return this;
    }

    async validate(): Promise<T | IBaseModel> {
        Logger.debug("validate()");

        await this.onPreValidate();

        Logger.debug("validating...");
        this.record = await this.joiSchema().validate(this.record) as T & IBaseModel;

        await this.onPostValidate();

        return this.record;
    }

    async update(client: MongoClient, newPayload: Partial<T>): Promise<BaseDocument<T, S>> {
        Logger.debug("update()");

        const oldPayload = {...this.record};
        try {
            this.record = {...this.record, ...newPayload, updatedAt: new Date()};
            await this.validate();
            await Repository.updateOne(<any>this.constructor, client, this.record._id, newPayload)
        } catch {
            this.record = {...oldPayload};
        }

        return this;
    }

    async delete(client: MongoClient, params: Partial<IDeletionParams> = {hard: false, cascade: false}): Promise<void> {
        const {hard, cascade} = params;
        if (hard) {
            await Repository.deleteOne(<any>this.constructor, client, {_id: this.record._id});
            this.record = undefined
            // TODO if cascaded, then also ripple the deletion to relations
        } else {
            const deletionFields = {deleted: true, deletedAt: new Date()};
            this.record = await Repository.updateOne(<any>this.constructor, client, this.record._id, deletionFields);
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

    async onPostUpdate(): Promise<void> {
        Logger.debug("onPostUpdate")
    }

    async onPreUpdate(): Promise<void> {
        Logger.debug("onPreValidate")
    }

    toJson(): T & IBaseModel {
        return this.record as T & IBaseModel;
    }

    async save(client: MongoClient): Promise<BaseDocument<T, S>> {
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
