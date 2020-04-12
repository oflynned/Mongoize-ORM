import {
  DatabaseClient,
  RelationalDocument,
  Repository
} from "../../../../src";
import { AnimalType, AnimalSchema, AnimalRelationships } from "./schema";
import Person from "../person";

class Animal extends RelationalDocument<
  AnimalType,
  AnimalSchema,
  AnimalRelationships
> {
  joiSchema(): AnimalSchema {
    return new AnimalSchema();
  }

  async relationalFields(
    depth: number,
    client: DatabaseClient
  ): Promise<AnimalRelationships> {
    await super.relationalFields(depth, client);
    return {
      owner: await this._owner()
    };
  }

  private async _owner(): Promise<Person> {
    return Repository.with(Person).findById(this.toJson().ownerId, {
      populate: false
    });
  }
}

export default Animal;
