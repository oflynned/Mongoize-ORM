import Schema, { IBaseModel } from "../../base-document/schema";
import Joi from "@hapi/joi";

// TODO can this be broken up into two interfaces
//      one on creation, another on post-save?
//      right now the space is somewhat polluted as it's two optionals as the base type
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
