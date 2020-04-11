import { BaseDocument } from "../base-document";
import Schema, {
  BaseModelType,
  BaseRelationshipType,
  InternalModelType
} from "../base-document/schema";
import { MongoClient } from "../../../persistence/client";

abstract class RelationalDocument<
  Type extends BaseModelType,
  JoiSchema extends Schema<Type>,
  RelationshipSchema extends BaseRelationshipType
> extends BaseDocument<Type, JoiSchema> {
  protected relationships: RelationshipSchema | any;

  protected async relationalFields(
    /* eslint-disable */
    client: MongoClient
    /* eslint-enable */
  ): Promise<RelationshipSchema | any> {
    return {};
  }

  async populate(
    client: MongoClient
  ): Promise<RelationalDocument<Type, JoiSchema, RelationshipSchema>> {
    this.relationships = { ...(await this.relationalFields(client)) };
    return this;
  }

  async update(
    client: MongoClient,
    payload: Partial<Omit<Type, keyof InternalModelType>>
  ): Promise<RelationalDocument<Type, JoiSchema, RelationshipSchema>> {
    await super.update(client, payload);
    return this.populate(client);
  }

  async save(
    client: MongoClient
  ): Promise<RelationalDocument<Type, JoiSchema, RelationshipSchema> | any> {
    await super.save(client);
    return this.populate(client);
  }

  toJson(): Type & InternalModelType & RelationshipSchema {
    return { ...this.record, ...this.relationships };
  }
}

export default RelationalDocument;
