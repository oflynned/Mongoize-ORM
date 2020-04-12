import Schema, { BaseModelType } from "../document/base-document/schema";
import BaseDocument from "../document/base-document";
import DatabaseClient from "../client/base.client";

export const defaultQueryOptions: QueryOptions = {
  populate: false
};

export const defaultUpdateOptions: UpdateOptions = {
  validateUpdate: true
};

export const defaultDeleteOptions: DeleteOptions = {
  hard: false
};

export type QueryOptions = Partial<{
  populate: boolean;
  client?: DatabaseClient;
}>;

export type UpdateOptions = Partial<{
  validateUpdate: boolean;
}>;

export type DeleteOptions = Partial<{
  hard: boolean;
}>;

export class Repository<
  Type extends BaseModelType,
  DocumentClass extends BaseDocument<Type, JoiSchema>,
  JoiSchema extends Schema<Type>
> {
  private documentInstance: DocumentClass;

  private defaultQueryOptions: QueryOptions;

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
    const repository: Repository<
      Type,
      DocumentClass,
      JoiSchema
    > = new Repository<Type, DocumentClass, JoiSchema>(new ChildModelClass());
    return repository.initialiseDefaults();
  }

  private initialiseDefaults(): Repository<Type, DocumentClass, JoiSchema> {
    this.defaultQueryOptions = {
      ...defaultQueryOptions,
      client: global.databaseClient
    };
    return this;
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
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<number> {
    return options.client.count(this.documentInstance.collection(), query);
  }

  async deleteCollection(
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<void> {
    await options.client.dropCollection(this.documentInstance.collection());
  }

  async deleteMany(
    query: object = {},
    options: QueryOptions & DeleteOptions = {
      ...defaultQueryOptions,
      ...defaultDeleteOptions
    }
  ): Promise<DocumentClass[]> {
    if (options.hard) {
      await options.client.deleteMany(
        this.documentInstance.collection(),
        query
      );
      return this.findMany(query, options);
    }

    const records = await this.findMany(query, options);
    return Promise.all(
      records.map(async (record: DocumentClass) =>
        this.updateOne(
          record.toJson()._id,
          {
            deletedAt: new Date(),
            deleted: true
          } as object,
          { ...options, validateUpdate: false }
        )
      )
    );
  }

  async deleteOne(
    _id: string,
    options: DeleteOptions & QueryOptions = {
      ...defaultQueryOptions,
      ...defaultDeleteOptions
    }
  ): Promise<DocumentClass | undefined> {
    if (await this.existsById(_id, options)) {
      if (options.hard) {
        await options.client.deleteOne(this.documentInstance.collection(), _id);
        return this.findById(_id, options);
      }

      return this.updateOne(
        _id,
        { deletedAt: new Date(), deleted: true } as object,
        { ...options, validateUpdate: false }
      );
    }

    return undefined;
  }

  async findOne(
    query: object,
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<DocumentClass | undefined> {
    options = { ...this.defaultQueryOptions, ...options };
    const records = await options.client.read(
      this.documentInstance.collection(),
      query
    );
    if (records.length > 0) {
      const instance: DocumentClass = (await Repository.newInstance(
        this.documentInstance
      ).from(records[0])) as DocumentClass;

      options.populate ? await instance.populate() : undefined;
      return instance;
    }

    return undefined;
  }

  async findById(
    _id: string,
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<DocumentClass> {
    return this.findOne({ _id }, options);
  }

  async existsByQuery(
    query: object,
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<boolean> {
    return (await this.count(query, options)) > 0;
  }

  async existsById(
    _id: string,
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<boolean> {
    return this.existsByQuery({ _id }, options);
  }

  async exists<Instance extends BaseDocument<Type, JoiSchema>>(
    instance: Instance,
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<boolean> {
    // if record was already hard deleted in another scope ... edge-case.
    if (!instance.toJson()) {
      return false;
    }

    // schrödinger's instance? is this method even needed?
    return this.existsById(instance.toJson()._id, options);
  }

  async updateOne(
    _id: string,
    updatedFields: Partial<Type>,
    options: UpdateOptions & QueryOptions = {
      ...defaultUpdateOptions,
      ...defaultQueryOptions
    }
  ): Promise<DocumentClass> {
    if (!(await this.existsById(_id, options))) {
      throw new Error("instance does not exist");
    }

    if (options.validateUpdate) {
      // validate the new payload as the repo should still respect db restraints
      // unless the `Type` generic is passed, the `updatedFields` param will not respect the instance type properties
      const instance = await this.findById(_id, options);
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

    await options.client.updateOne(
      this.documentInstance.collection(),
      _id,
      updatedFields
    );
    return this.findById(_id, options);
  }

  async findAll(
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<DocumentClass[]> {
    return this.findMany({}, options);
  }

  async findMany(
    query: object,
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<DocumentClass[]> {
    options = { ...this.defaultQueryOptions, ...options };
    const records = await options.client.read(
      this.documentInstance.collection(),
      query
    );

    return Promise.all(
      records.map(async (record: object) => {
        const instance: DocumentClass = (await Repository.newInstance(
          this.documentInstance
        ).from(record)) as DocumentClass;

        options.populate ? await instance.populate() : undefined;
        return instance;
      })
    );
  }
}
