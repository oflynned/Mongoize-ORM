import Repository from "./models/repository";
import {
  MongoClient,
  InMemoryClient,
  ConnectionOptions
} from "./persistence/client";
import BaseDocument, {
  Schema,
  IDeletionParams
} from "./models/documents/base-document";
import CredentialDocument, {
  CredentialSchema,
  ICredential
} from "./models/documents/credential-document";
import Joi from "@hapi/joi";

export {
  Repository,
  MongoClient,
  InMemoryClient,
  ConnectionOptions,
  CredentialSchema,
  CredentialDocument,
  ICredential,
  Schema,
  BaseDocument,
  Joi
};
