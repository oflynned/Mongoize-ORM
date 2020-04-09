import { CredentialDocument } from "../../../../src";
import { UserType, UserSchema } from "./schema";

class User extends CredentialDocument<UserType, UserSchema> {
  joiSchema(): UserSchema {
    return new UserSchema();
  }
}

export default User;
