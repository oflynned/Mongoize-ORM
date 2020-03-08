import Joi from "joi";
import BaseDocument from "../../../models/documents/base.document";
import Schema from "../../../models/schema/schema.model";

export type IUser = {
    name: string;
    email: string;
    password?: string;
    hash?: string;
}

export class UserSchema extends Schema<IUser> {
    joiSchema(): object {
        return {
            name: Joi.string().required(),
            email: Joi.string().required(),
            hash: Joi.string().required()
        }
    }
}

export class User extends BaseDocument<IUser, UserSchema> {
    joiSchema(): UserSchema {
        return new UserSchema();
    }

    async onPreValidate(): Promise<void> {
        this.record.hash = "hashed_" + this.record.password;
    }
}
