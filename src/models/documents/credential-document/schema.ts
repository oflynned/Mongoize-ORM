import Schema from "../../schema/schema.model";
import Joi from "joi";

export type ICredential = {
  password?: string;
  passwordHash?: string;
};

export abstract class CredentialSchema<T> extends Schema<T> {
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
