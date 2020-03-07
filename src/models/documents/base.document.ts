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
}

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

    validate(): void {
        console.log("validate()");
        this.joiSchema().validate(this.record);
    }

    async save(): Promise<BaseDocument<T, S>> {
        await this.onPreValidate();
        await this.onPostValidate();
        await this.onPreSave();

        // TODO replace me with a repo style function call to the persistence layer
        console.log("save()");

        await this.onPostSave();
        return Promise.resolve(this);
    }

    update(newPayload: Partial<T>): Promise<BaseDocument<T, S>> {
        console.log("update()");
        this.record = {...this.record, ...newPayload, updatedAt: new Date()};
        return Promise.resolve(this);
    }

    delete(): void {
        console.log("delete()");
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
