import { compare, hash } from "bcrypt";
import BaseDocument, { BaseModelType } from "../base-document";
import Logger from "../../../logger";
import CredentialSchema, { CredentialType } from "./schema";
import { MongoClient } from "../../../persistence/client";
import {
  BaseRelationshipType,
  InternalModelType
} from "../base-document/schema";

abstract class CredentialDocument<
  Type extends CredentialType,
  JoiSchema extends CredentialSchema<Type>,
  RelationalFields extends BaseRelationshipType
> extends BaseDocument<Type, JoiSchema, RelationalFields> {
  // recommended cost factor
  saltRounds = 12;

  // to prevent denial of service through a hash bomb
  minPlaintextPasswordLength = 6;
  maxPlaintextPasswordLength = 128;

  // here is a base password regex to get started
  // must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character
  passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+$/;

  build(
    payload: Omit<Type, keyof InternalModelType>
  ): CredentialDocument<Type, JoiSchema, RelationalFields> {
    return super.build(payload) as CredentialDocument<
      Type,
      JoiSchema,
      RelationalFields
    >;
  }

  async passwordAttemptMatches(passwordAttempt: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // record hasn't been validated & hashed yet
      if (!this.record.passwordHash) {
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

  async onPrePasswordHash(): Promise<void> {
    Logger.debug("onPrePasswordHash()");
    Logger.debug(
      "Override any password checks here as necessary to your use case"
    );

    if (this.record.password.length < this.minPlaintextPasswordLength) {
      throw new Error("password is too short");
    }

    if (this.record.password.length > this.maxPlaintextPasswordLength) {
      throw new Error("password is too long");
    }

    if (!this.passwordRegex.test(this.record.password)) {
      throw new Error("password does not match minimum requirements");
    }
  }

  async onPreValidate(): Promise<void> {
    await super.onPreValidate();
    await this.onPrePasswordHash();
    this.record.passwordHash = await this.hashPassword();
    delete this.record.password;
    await this.onPostPasswordHash();
  }

  async updatePassword(
    client: MongoClient,
    newPassword: string
  ): Promise<void> {
    this.record.password = newPassword;

    await this.onPrePasswordHash();
    this.record.passwordHash = await this.hashPassword();
    delete this.record.password;

    await this.onPostPasswordHash();
    await this.update(client, {
      passwordHash: this.record.passwordHash
    } as Type);
  }

  async hashPassword(): Promise<string> {
    return new Promise((resolve, reject) => {
      hash(this.record.password, this.saltRounds, (error, passwordHash) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(passwordHash);
      });
    });
  }

  async onPostPasswordHash(): Promise<void> {
    Logger.debug("onPostPasswordHash()");
  }
}

export default CredentialDocument;
