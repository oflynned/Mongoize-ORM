import Repository from "./models/documents/repository";
import { MongoClient, InMemoryClient, ConnectionOptions } from "./persistence";
import BaseDocument from "./models/documents/base.document";
import Schema from "./models/schema/schema.model";
import CredentialDocument, {
  CredentialSchema,
  ICredential
} from "./models/documents/credential-document";
import Joi from "joi";

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
