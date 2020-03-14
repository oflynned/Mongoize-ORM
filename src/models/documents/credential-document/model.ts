import { compare, hash } from "bcrypt";
import BaseDocument from "../base.document";
import Logger from "../../../logger";
import { CredentialSchema, ICredential } from "./schema";

abstract class CredentialDocument<
  T extends ICredential,
  S extends CredentialSchema<T>
> extends BaseDocument<T, S> {
  saltRounds = 12;

  async passwordAttemptMatches(passwordAttempt: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // record hasn't been validated & hashed yet
      if (this.record.passwordHash === undefined) {
        resolve(false);
        return;
      }

      compare(passwordAttempt, this.record.passwordHash, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      });
    });
  }

  onPostPasswordHash() {
    Logger.debug("onPostHashPreValidation()");
  }

  async onPreValidate(): Promise<void> {
    return new Promise((resolve, reject) => {
      hash(this.record.password, this.saltRounds, (error, passwordHash) => {
        if (error) {
          reject(error);
          return;
        }

        delete this.record.password;
        this.record.passwordHash = passwordHash;
        this.onPostPasswordHash();
        resolve();
      });
    });
  }
}

export default CredentialDocument;
