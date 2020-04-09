import Repository from "./models/repository";
import {
  MongoClient,
  InMemoryClient,
  ConnectionOptions
} from "./persistence/client";
import BaseDocument, {
  Schema,
  DeletionParams
} from "./models/documents/base-document";
import CredentialDocument, {
  CredentialSchema,
  CredentialType
} from "./models/documents/credential-document";
import Joi from "@hapi/joi";

export {
  Repository,
  MongoClient,
  InMemoryClient,
  ConnectionOptions,
  CredentialSchema,
  CredentialDocument,
  CredentialType,
  Schema,
  BaseDocument,
  Joi
};
