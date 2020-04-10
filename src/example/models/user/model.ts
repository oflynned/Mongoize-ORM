import { BaseRelationshipType, CredentialDocument } from "../../../../src";
import { UserType, UserSchema } from "./schema";

class User extends CredentialDocument<
  UserType,
  UserSchema,
  BaseRelationshipType
> {
  joiSchema(): UserSchema {
    return new UserSchema();
  }
}

export default User;
