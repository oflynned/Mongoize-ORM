import Repository from "./repository";
import { bindGlobalDatabaseClient } from "./express";
import {
  DatabaseClient,
  MongoClient,
  InMemoryClient,
  ConnectionOptions
} from "./client";
import BaseDocument, {
  Schema,
  DeletionParams,
  BaseModelType,
  BaseRelationshipType
} from "./document/base-document";
import CredentialDocument, {
  CredentialSchema,
  CredentialType
} from "./document/credential-document";
import RelationalDocument from "./document/relational-document";
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
