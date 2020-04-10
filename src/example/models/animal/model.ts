import { BaseDocument, MongoClient, Repository } from "../../../../src";
import { AnimalType, AnimalSchema, AnimalRelationships } from "./schema";
import Person from "../person";

class Animal extends BaseDocument<
  AnimalType,
  AnimalSchema,
  AnimalRelationships
> {
  joiSchema(): AnimalSchema {
    return new AnimalSchema();
  }

  async relationalFields(client: MongoClient): Promise<AnimalRelationships> {
    return {
      owner: await this.owner(client)
    };
  }

  async owner(client: MongoClient): Promise<Person> {
    return Repository.with(Person).findById(client, this.toJson().ownerId);
  }
}

export default Animal;
