import Schema, { BaseModelType } from "../documents/base-document/schema";
import BaseDocument, { DeletionParams } from "../documents/base-document";
import DatabaseClient from "../../persistence/client/base.client";

export class Repository<
  Type extends BaseModelType,
  DocumentClass extends BaseDocument<Type, JoiSchema>,
  JoiSchema extends Schema<Type>
> {
  private instanceType: DocumentClass;

  private constructor(instance: DocumentClass) {
    this.instanceType = instance;
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

  async count(client: DatabaseClient, query: object = {}): Promise<number> {
    return client.count(this.instanceType.collection(), query);
  }

  async deleteCollection(client: DatabaseClient): Promise<void> {
    await client.dropCollection(this.instanceType.collection());
  }

  async deleteMany(
    client: DatabaseClient,
    query: object = {},
    params: DeletionParams = { hard: false }
  ): Promise<DocumentClass[]> {
    if (params.hard) {
      await client.deleteMany(this.instanceType.collection(), query);
      return [];
    }

    const records = await this.findMany(client, query);
    return await Promise.all(
      records.map(async (record: DocumentClass) =>
        this.updateOne(client, record.toJson()._id, {
          deletedAt: new Date(),
          deleted: true
        } as object)
      )
    );
  }

  async deleteOne(
    client: DatabaseClient,
    _id: string,
    params: DeletionParams = { hard: false }
  ): Promise<DocumentClass | undefined> {
    if (await this.existsById(client, _id)) {
      if (params.hard) {
        await client.deleteOne(this.instanceType.collection(), _id);
        return undefined;
      }

      return this.updateOne(
        client,
        _id,
        {
          deletedAt: new Date(),
          deleted: true
        } as object,
        false
      );
    }

    return undefined;
  }

  async findOne(
    client: DatabaseClient,
    query: object
  ): Promise<DocumentClass | undefined> {
    const records = await client.read(this.instanceType.collection(), query);
    if (records.length > 0) {
      return Repository.newInstance(this.instanceType).from(
        records[0]
      ) as DocumentClass;
    }

    return undefined;
  }

  async findById(client: DatabaseClient, _id: string): Promise<DocumentClass> {
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

  // TODO pass options instead of a boolean for .validateUpdate
  async updateOne(
    client: DatabaseClient,
    _id: string,
    updatedFields: Partial<Type>,
    validateUpdate = true
  ): Promise<DocumentClass> {
    if (!(await this.existsById(client, _id))) {
      throw new Error("instance does not exist");
    }

    if (validateUpdate) {
      // validate the new payload as the repo should still respect db restraints
      // unless the `Type` generic is passed, the `updatedFields` param will not respect the instance type properties
      // this could be beneficial or a drawback? tbd
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

    // dispatch an update to the db once validations pass
    await client.updateOne(this.instanceType.collection(), _id, updatedFields);

    return this.findById(client, _id);
  }

  async findAll(client: DatabaseClient): Promise<DocumentClass[]> {
    return this.findMany(client, {});
  }

  async findMany(
    client: DatabaseClient,
    query: object
  ): Promise<DocumentClass[]> {
    const records = await client.read(this.instanceType.collection(), query);
    return records.map(
      (record: object) =>
        Repository.newInstance(this.instanceType).from(record) as DocumentClass
    );
  }

  // TODO should a validator be called at some point to ensure the instance was actually populated correctly?
  private static newInstance<
    Type extends BaseModelType,
    DocumentClass extends BaseDocument<Type, JoiSchema>,
    JoiSchema extends Schema<Type>
  >(instance: DocumentClass): DocumentClass {
    return new (instance.constructor as { new (): DocumentClass })();
  }
}
