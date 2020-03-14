import Joi from "joi";
import {
  CredentialSchema,
  ICredential
} from "../../../models/documents/credential-document";

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
