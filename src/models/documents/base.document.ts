import UnimplementedError from '../errors/unimplemented.error';
import SchemaValidator from "../validator/schema.validator";
import BaseSchema from "../schema/schema.model";

interface IBaseDocument {
    onPreValidate(): void;

    onPostValidate(): void;

    onPreSave(): void;

    onPostSave(): void;

    onPreDelete(): void;

    onPostDelete(): void;
}

class BaseDocument<T extends BaseSchema> implements IBaseDocument {
    private schema: T;
    private schemaValidator: SchemaValidator;

    constructor() {
        this.schemaValidator = new SchemaValidator();
    }

    static collection() {
        throw new UnimplementedError();
    }

    build(params: T): BaseDocument<T> {
        return this;
    }

    validate(): void {
    }

    save(): void {
    }

    update(): void {
    }

    delete(): void {
    }

    onPostDelete(): void {
    }

    onPostSave(): void {
    }

    onPostValidate(): void {
    }

    onPreDelete(): void {
    }

    onPreSave(): void {
    }

    onPreValidate(): void {
    }
}

export default BaseDocument;
