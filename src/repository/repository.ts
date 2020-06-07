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
  limit?: number;
  offset?: number;
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
    options = { ...this.defaultQueryOptions, ...options };
    return options.client.count(this.documentInstance.collection(), query);
  }

  async deleteCollection(
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<void> {
    await options.client.dropCollection(this.documentInstance.collection());
  }

  async hardDeleteOne(
    _id: string,
    options: QueryOptions = { ...defaultQueryOptions }
  ): Promise<DocumentClass | undefined> {
    return this.deleteOne(_id, {
      ...defaultQueryOptions,
      ...options,
      hard: true
    });
  }

  async hardDeleteMany(
    query: object,
    options: QueryOptions = { ...defaultQueryOptions }
  ): Promise<DocumentClass[] | undefined[]> {
    return this.deleteMany(query, {
      ...defaultQueryOptions,
      ...options,
      hard: true
    });
  }

  async softDeleteOne(
    _id: string,
    options: QueryOptions = { ...defaultQueryOptions }
  ): Promise<DocumentClass | undefined> {
    return this.deleteOne(_id, {
      ...defaultQueryOptions,
      ...options,
      hard: false
    });
  }

  async softDeleteMany(
    query: object,
    options: QueryOptions = { ...defaultQueryOptions }
  ): Promise<DocumentClass[] | undefined[]> {
    return this.deleteMany(query, {
      ...defaultQueryOptions,
      ...options,
      hard: false
    });
  }

  private async deleteOne(
    _id: string,
    options: DeleteOptions & QueryOptions = {
      ...this.defaultQueryOptions,
      ...defaultDeleteOptions
    }
  ): Promise<DocumentClass | undefined> {
    options = {
      ...this.defaultQueryOptions,
      ...defaultDeleteOptions,
      ...options
    };

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

  private async deleteMany(
    query: object = {},
    options: QueryOptions & DeleteOptions = {
      ...this.defaultQueryOptions,
      ...defaultDeleteOptions
    }
  ): Promise<DocumentClass[]> {
    // passing .hard but not passing .client will set .client to null instead of coalescing defaults
    options = {
      ...this.defaultQueryOptions,
      ...defaultDeleteOptions,
      ...options
    };

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

  async findOne(
    query: object,
    options: QueryOptions = this.defaultQueryOptions
  ): Promise<DocumentClass | undefined> {
    options = { ...this.defaultQueryOptions, ...options };
    const records = await options.client.read(
      this.documentInstance.collection(),
      query,
      {}
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
    options = { ...this.defaultQueryOptions, ...options };
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
      ...this.defaultQueryOptions,
      ...defaultUpdateOptions
    }
  ): Promise<DocumentClass> {
    options = {
      ...this.defaultQueryOptions,
      ...defaultUpdateOptions,
      ...options
    };

    if (!(await this.existsById(_id, options))) {
      throw new Error("instance does not exist");
    }

    if (options.validateUpdate) {
      // validate the new payload as the repo should still respect db restraints
      // unless the `Type` generic is passed, the `updatedFields` param will not respect the instance type properties
      const instance = await this.findById(_id, options);
      updatedFields = await instance.validateUpdate(updatedFields);
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
      query,
      { limit: options.limit, offset: options.offset }
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
