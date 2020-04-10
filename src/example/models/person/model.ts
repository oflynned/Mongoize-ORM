import { BaseDocument, MongoClient, Repository } from "../../../../src";
import { PersonType, PersonSchema, PersonRelationships } from "./schema";
import Animal from "../animal";

class Person extends BaseDocument<
  PersonType,
  PersonSchema,
  PersonRelationships
> {
  joiSchema(): PersonSchema {
    return new PersonSchema();
  }

  collection(): string {
    return "people";
  }

  async relationalFields(client: MongoClient): Promise<PersonRelationships> {
    return {
      pets: await Repository.with(Animal).findMany(client, {
        // ownerId: this.record._id
        ownerId: ".populate() overflows this right now"
      })
    };
  }
}

export default Person;
