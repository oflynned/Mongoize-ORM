import Schema from "../schema/schema.model";

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
        console.log("validate()");

        await this.onPreValidate();
        console.log("validating...");
        await this.joiSchema().validate(this.record);
        await this.onPostValidate();
    }

    async save(): Promise<BaseDocument<T, S>> {
        await this.validate();

        console.log("save()");
        await this.onPreSave();

        // TODO replace me with a repo style function call to the persistence layer
        console.log("saving...");

        await this.onPostSave();
        return Promise.resolve(this);
    }

    async update(newPayload: Partial<T>): Promise<BaseDocument<T, S>> {
        console.log("update()");
        this.record = {...this.record, ...newPayload, updatedAt: new Date()};
        await this.validate();
        return this;
    }

    delete(purge = false): void {
        console.log("delete()");
        if (purge) {
            this.record = undefined
        } else {
            const deletionFields = {deleted: true, deletedAt: new Date()};
            this.record = {...this.record, ...deletionFields}
        }
    }

    onPostDelete(): void {
        console.log("onPostDelete")
    }

    onPostSave(): void {
        console.log("onPostSave")
    }

    onPostValidate(): void {
        console.log("onPostValidate")
    }

    onPreDelete(): void {
        console.log("onPreDelete")
    }

    onPreSave(): void {
        console.log("onPreSave")
    }

    onPreValidate(): void {
        console.log("onPreValidate")
    }

    toJson() {
        return this.record;
    }
}

export default BaseDocument;
