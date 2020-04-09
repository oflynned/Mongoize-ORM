import Schema, { IBaseModel } from "../../base-document/schema";
import Joi from "@hapi/joi";

export interface ICredential extends IBaseModel {
  password?: string;
  passwordHash?: string;
}

export abstract class CredentialSchema<T extends ICredential> extends Schema<
  T
> {
  abstract schemaWithoutCredentials(): object;

  joiBaseSchema(): object {
    return {
      ...this.schemaWithoutCredentials(),
      passwordHash: Joi.string().required()
    };
  }

  joiUpdateSchema(): object {
    return {
      passwordHash: Joi.string()
    };
  }
}
