import { BaseDocument } from "../base-document";
import Schema, {
  BaseModelType,
  BaseRelationshipType,
  InternalModelType
} from "../base-document/schema";
import { DatabaseClient } from "../../client";

abstract class RelationalDocument<
  Type extends BaseModelType,
  JoiSchema extends Schema<Type>,
  RelationshipType extends BaseRelationshipType
> extends BaseDocument<Type, JoiSchema> {
  protected relationships: RelationshipType | any;
  protected maxPopulateDepth = 10;
  private currentPopulateDepth = 0;

  /* eslint-disable */
  protected async relationalFields(
    depth: number,
    client: DatabaseClient = global.databaseClient
  ): Promise<RelationshipType | any> {
    this.currentPopulateDepth = depth + 1;
    return {};
  }
  /* eslint-enable */

  async populate(
    client: DatabaseClient = global.databaseClient
  ): Promise<RelationalDocument<Type, JoiSchema, RelationshipType>> {
    if (this.currentPopulateDepth >= this.maxPopulateDepth) {
      return this;
    }

    this.relationships = {
      ...(await this.relationalFields(this.currentPopulateDepth, client))
    };

    Object.assign(
      this as any,
      this.record as Type,
      this.relationships as RelationshipType
    );
    return this;
  }

  async update(
    payload: Partial<Omit<Type, keyof InternalModelType>>,
    client: DatabaseClient = global.databaseClient
  ): Promise<RelationalDocument<Type, JoiSchema, RelationshipType>> {
    await super.update(payload, client);
    return this;
  }

  async save(
    client: DatabaseClient = global.databaseClient
  ): Promise<RelationalDocument<Type, JoiSchema, RelationshipType> | any> {
    await super.save(client);
    return this;
  }

  toJson(): InternalModelType & Type & RelationshipType {
    return { ...this.record, ...this.relationships };
  }
}

export default RelationalDocument;
