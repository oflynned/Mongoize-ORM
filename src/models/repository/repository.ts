import Schema, { BaseModelType } from "../documents/base-document/schema";
import BaseDocument, { DeletionParams } from "../documents/base-document";
import DatabaseClient from "../../persistence/client/base.client";

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
    JoiSchema extends Schema<Type>
  >(instance: DocumentClass): DocumentClass {
    return new (instance.constructor as { new (): DocumentClass })();
  }

  async count(
    query: object = {},
    client: DatabaseClient = global.databaseClient
  ): Promise<number> {
    return client.count(this.documentInstance.collection(), query);
  }

  async deleteCollection(
    client: DatabaseClient = global.databaseClient
  ): Promise<void> {
    await client.dropCollection(this.documentInstance.collection());
  }

  async deleteMany(
    query: object = {},
    params: DeletionParams = { hard: false },
    client: DatabaseClient = global.databaseClient
  ): Promise<DocumentClass[]> {
    if (params.hard) {
      await client.deleteMany(this.documentInstance.collection(), query);
      return this.findMany(query, client);
    }

    const records = await this.findMany(query, client);
    return Promise.all(
      records.map(async (record: DocumentClass) =>
        this.updateOne(
          record.toJson()._id,
          {
            deletedAt: new Date(),
            deleted: true
          } as object,
          { validateUpdate: false },
          client
        )
      )
    );
  }

  async deleteOne(
    _id: string,
    params: DeletionParams = { hard: false },
    client: DatabaseClient = global.databaseClient
  ): Promise<DocumentClass | undefined> {
    if (await this.existsById(_id, client)) {
      if (params.hard) {
        await client.deleteOne(this.documentInstance.collection(), _id);
        return this.findById(_id, client);
      }

      return this.updateOne(
        _id,
        { deletedAt: new Date(), deleted: true } as object,
        { validateUpdate: false },
        client
      );
    }

    return undefined;
  }

  async findOne(
    query: object,
    client: DatabaseClient = global.databaseClient
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

  async findById(
    _id: string,
    client: DatabaseClient = global.databaseClient
  ): Promise<DocumentClass> {
    return this.findOne({ _id }, client);
  }

  async existsByQuery(
    query: object,
    client: DatabaseClient = global.databaseClient
  ): Promise<boolean> {
    return (await this.count(query, client)) > 0;
  }

  async existsById(
    _id: string,
    client: DatabaseClient = global.databaseClient
  ): Promise<boolean> {
    return this.existsByQuery({ _id }, client);
  }

  async exists<Instance extends BaseDocument<Type, JoiSchema>>(
    instance: Instance,
    client: DatabaseClient = global.databaseClient
  ): Promise<boolean> {
    // if record was already hard deleted in another scope ... edge-case.
    if (!instance.toJson()) {
      return false;
    }

    // schrödinger's instance? is this method even needed?
    return this.existsById(instance.toJson()._id, client);
  }

  async updateOne(
    _id: string,
    updatedFields: Partial<Type>,
    options: UpdateOptions = defaultUpdateOptions,
    client: DatabaseClient = global.databaseClient
  ): Promise<DocumentClass> {
    if (!(await this.existsById(_id, client))) {
      throw new Error("instance does not exist");
    }

    if (options.validateUpdate) {
      // validate the new payload as the repo should still respect db restraints
      // unless the `Type` generic is passed, the `updatedFields` param will not respect the instance type properties
      const instance = await this.findById(_id, client);
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
    return this.findById(_id, client);
  }

  async findAll(): Promise<DocumentClass[]> {
    return this.findMany({});
  }

  async findMany(
    query: object,
    client: DatabaseClient = global.databaseClient
  ): Promise<DocumentClass[]> {
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
