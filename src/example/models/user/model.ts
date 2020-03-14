import { CredentialDocument } from "../../../models/documents/credential-document/credential.document";
import { IUser, UserSchema } from "./schema";

class User extends CredentialDocument<IUser, UserSchema> {
  joiSchema(): UserSchema {
    return new UserSchema();
  }
}

export default User;
