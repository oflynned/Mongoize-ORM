import { CredentialDocument } from "../../../../src";
import { IUser, UserSchema } from "./schema";

class User extends CredentialDocument<IUser, UserSchema> {
  joiSchema(): UserSchema {
    return new UserSchema();
  }
}

export default User;
