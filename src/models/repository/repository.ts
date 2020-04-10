import Schema, {
  BaseModelType,
  BaseRelationshipType
} from "../documents/base-document/schema";
import BaseDocument, { DeletionParams } from "../documents/base-document";
import DatabaseClient from "../../persistence/client/base.client";
import { MongoClient } from "../../index";

type UpdateOptions = Partial<{
  validateUpdate: boolean;
}>;

const defaultUpdateOptions: UpdateOptions = {
  validateUpdate: true
};

export class Repository<
  Type extends BaseModelType,
  DocumentClass extends BaseDocument<Type, JoiSchema>,
  JoiSchema extends Schema<Type>
> {
  private documentInstance: DocumentClass;

  private constructor(documentInstance: DocumentClass) {
    this.documentInstance = documentInstance;
  }

  static with<
    Type extends BaseModelType,
    DocumentClass extends BaseDocument<Type, JoiSchema>,
    JoiSchema extends Schema<Type>
  >(ChildModelClass: {
    new (...args: any[]): DocumentClass;
  }): Repository<Type, DocumentClass, JoiSchema> {
    return new Repository<Type, DocumentClass, JoiSchema>(
      new ChildModelClass()
    );
  }

  private static newInstance<
    Type extends BaseModelType,
    DocumentClass extends BaseDocument<Type, JoiSchema>,
    JoiSchema extends Schema<Type>,
    RelationalFields extends BaseRelationshipType
  >(instance: DocumentClass): DocumentClass {
    return new (instance.constructor as { new (): DocumentClass })();
  }

  async count(client: DatabaseClient, query: object = {}): Promise<number> {
    return client.count(this.documentInstance.collection(), query);
  }

  async deleteCollection(client: DatabaseClient): Promise<void> {
    await client.dropCollection(this.documentInstance.collection());
  }

  async deleteMany(
    client: MongoClient,
    query: object = {},
    params: DeletionParams = { hard: false }
  ): Promise<DocumentClass[]> {
    if (params.hard) {
      await client.deleteMany(this.documentInstance.collection(), query);
      return this.findMany(client, query);
    }

    const records = await this.findMany(client, query);
    return Promise.all(
      records.map(async (record: DocumentClass) =>
        // TODO same here, `as object` looks somewhat hacky for internal methods
        this.updateOne(client, record.toJson()._id, {
          deletedAt: new Date(),
          deleted: true
        } as object)
      )
    );
  }

  async deleteOne(
    client: MongoClient,
    _id: string,
    params: DeletionParams = { hard: false }
  ): Promise<DocumentClass | undefined> {
    if (await this.existsById(client, _id)) {
      if (params.hard) {
        await client.deleteOne(this.documentInstance.collection(), _id);
        return this.findById(client, _id);
      }

      return this.updateOne(
        client,
        _id,
        // TODO should probably try to abstract out typing internal properties instead of just using `as object`
        { deletedAt: new Date(), deleted: true } as object,
        { validateUpdate: false }
      );
    }

    return undefined;
  }

  async findOne(
    client: MongoClient,
    query: object
  ): Promise<DocumentClass | undefined> {
    const records = await client.read(
      this.documentInstance.collection(),
      query
    );
    if (records.length > 0) {
      return Repository.newInstance(this.documentInstance).from(
        records[0]
      ) as DocumentClass;
    }

    return undefined;
  }

  async findById(client: MongoClient, _id: string): Promise<DocumentClass> {
    return this.findOne(client, { _id });
  }

  async existsByQuery(client: DatabaseClient, query: object): Promise<boolean> {
    return (await this.count(client, query)) > 0;
  }

  async existsById(client: DatabaseClient, _id: string): Promise<boolean> {
    return this.existsByQuery(client, { _id });
  }

  async exists<Instance extends BaseDocument<Type, JoiSchema>>(
    client: DatabaseClient,
    instance: Instance
  ): Promise<boolean> {
    // if record was already hard deleted in another scope ... edge-case.
    if (!instance.toJson()) {
      return false;
    }

    // schrödinger's instance? is this method even needed?
    return this.existsById(client, instance.toJson()._id);
  }

  async updateOne(
    client: MongoClient,
    _id: string,
    updatedFields: Partial<Type>,
    options: UpdateOptions = defaultUpdateOptions
  ): Promise<DocumentClass> {
    if (!(await this.existsById(client, _id))) {
      throw new Error("instance does not exist");
    }

    if (options.validateUpdate) {
      // validate the new payload as the repo should still respect db restraints
      // unless the `Type` generic is passed, the `updatedFields` param will not respect the instance type properties
      const instance = await this.findById(client, _id);
      const { value, error } = instance
        .joiSchema()
        .validateUpdate(updatedFields);

      if (error) {
        throw error;
      }

      if (Object.keys(value).length === 0) {
        throw new Error("pruned update was empty");
      }

      updatedFields = value;
    }

    await client.updateOne(
      this.documentInstance.collection(),
      _id,
      updatedFields
    );
    return this.findById(client, _id);
  }

  async findAll(client: MongoClient): Promise<DocumentClass[]> {
    return this.findMany(client, {});
  }

  async findMany(client: MongoClient, query: object): Promise<DocumentClass[]> {
    const records = await client.read(
      this.documentInstance.collection(),
      query
    );

    return Promise.all(
      records.map(async (record: object) => {
        return Repository.newInstance(this.documentInstance).from(
          record
        ) as DocumentClass;
      })
    );
  }
}
