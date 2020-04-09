import { CredentialSchema, CredentialType, Joi } from "../../../../src";

export interface UserType extends CredentialType {
  name: string;
  email: string;
}

export class UserSchema extends CredentialSchema<UserType> {
  schemaWithoutCredentials(): object {
    return {
      name: Joi.string().required(),
      email: Joi.string().required()
    };
  }
}
