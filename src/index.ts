import Repository from "./models/repository";
import { bindGlobalDatabaseClient } from "./express";
import {
  DatabaseClient,
  MongoClient,
  InMemoryClient,
  ConnectionOptions
} from "./persistence/client";
import BaseDocument, {
  Schema,
  DeletionParams,
  BaseModelType,
  BaseRelationshipType
} from "./models/documents/base-document";
import CredentialDocument, {
  CredentialSchema,
  CredentialType
} from "./models/documents/credential-document";
import RelationalDocument from "./models/documents/relational-document";
import Joi from "@hapi/joi";

export {
  bindGlobalDatabaseClient,
  BaseRelationshipType,
  BaseModelType,
  DeletionParams,
  Repository,
  MongoClient,
  InMemoryClient,
  DatabaseClient,
  ConnectionOptions,
  CredentialSchema,
  CredentialDocument,
  CredentialType,
  Schema,
  BaseDocument,
  RelationalDocument,
  Joi
};
