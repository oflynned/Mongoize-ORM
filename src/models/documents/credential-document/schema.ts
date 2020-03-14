import Schema from "../../schema/schema.model";
import Joi from "joi";

export type ICredential = {
  password?: string;
  passwordHash?: string;
};

export abstract class CredentialSchema<T> extends Schema<T> {
  private static credentialSchema(): object {
    return {
      passwordHash: Joi.string().required()
    };
  }

  abstract schemaWithoutCredentials(): object;

  joiSchema(): object {
    return {
      ...this.schemaWithoutCredentials(),
      ...CredentialSchema.credentialSchema()
    };
  }
}
