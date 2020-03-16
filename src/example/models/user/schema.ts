import { CredentialSchema, ICredential, Joi } from "../../../../src";

export interface IUser extends ICredential {
  name: string;
  email: string;
}

export class UserSchema extends CredentialSchema<IUser> {
  schemaWithoutCredentials(): object {
    return {
      name: Joi.string().required(),
      email: Joi.string().required()
    };
  }
}
