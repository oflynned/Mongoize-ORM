import Schema from "../schema/schema.model";
import Joi from "joi";
import BaseDocument from "./base.document";
import {compare, hash} from 'bcrypt';
import Logger from "../../logger";

export type ICredential = {
    password?: string;
    passwordHash?: string;
}

export abstract class CredentialSchema<T> extends Schema<T> {
    private static credentialSchema(): object {
        return {
            passwordHash: Joi.string().required()
        }
    }

    abstract schemaWithoutCredentials(): object;

    joiSchema(): object {
        return {...this.schemaWithoutCredentials(), ...CredentialSchema.credentialSchema()};
    }
}

export abstract class CredentialDocument<T extends ICredential, S extends CredentialSchema<T>> extends BaseDocument<T, S> {
    saltRounds = 12;

    async passwordAttemptMatches(passwordAttempt: string): Promise<boolean> {
        return new Promise(((resolve, reject) => {
            compare(passwordAttempt, this.record.passwordHash, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            })
        }))
    };

    onPostPasswordHash() {
        Logger.debug("onPostHashPreValidation()")
    }

    async onPreValidate(): Promise<void> {
        return new Promise((resolve, reject) => {
            hash(this.record.password, this.saltRounds, (error, passwordHash) => {
                if (error) {
                    reject(error);
                    return;
                }

                delete this.record.password;
                this.record.passwordHash = passwordHash;
                this.onPostPasswordHash();
                resolve();
            })
        })
    }

}
