import Schema from "../schema/schema.model";
import Logger from "../../logger";

interface IBaseDocument {
    onPreValidate(): void;

    onPostValidate(): void;

    onPreSave(): void;

    onPostSave(): void;

    onPreDelete(): void;

    onPostDelete(): void;
}

interface ISchema<T, S extends Schema<any>> {
    joiSchema(): S;

    toJson(): T;
}

// TODO
//      what about a use case of hashing a password before saving?
//      auto update timestamps on an update being made (CUD)
//      pseudo-relational data, ie type relations (1-n, n-1, n-n)

abstract class BaseDocument<T, S extends Schema<any>> implements IBaseDocument, ISchema<T, S> {
    private record: T;

    constructor() {
    }

    static collection(): string {
        return "collections"
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

    async save(): Promise<BaseDocument<T, S>> {
        await this.validate();

        Logger.debug("save()");
        await this.onPreSave();

        // TODO replace me with a repo style function call to the persistence layer
        Logger.debug("saving...");

        await this.onPostSave();
        return Promise.resolve(this);
    }

    async update(newPayload: Partial<T>): Promise<BaseDocument<T, S>> {
        Logger.debug("update()");

        // FIXME this is really bad for consistency, we're updating prematurely and rolling back on fail
        const oldPayload = {...this.record};
        try {
            this.record = {...this.record, ...newPayload, updatedAt: new Date()};
            await this.validate();
        } catch {
            this.record = {...oldPayload};
        }

        return this;
    }

    delete(purge = false): void {
        Logger.debug("delete()");
        if (purge) {
            this.record = undefined
        } else {
            const deletionFields = {deleted: true, deletedAt: new Date()};
            this.record = {...this.record, ...deletionFields}
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

    toJson() {
        return this.record;
    }
}

export default BaseDocument;
