import { RelationalDocument, Repository } from "../../../../src";
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

  async relationalFields(): Promise<AnimalRelationships> {
    return {
      owner: await this.owner()
    };
  }

  private async owner(): Promise<Person> {
    return Repository.with(Person).findById(this.toJson().ownerId);
  }
}

export default Animal;
