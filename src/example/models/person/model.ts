import { MongoClient, RelationalDocument, Repository } from "../../../../src";
import { PersonType, PersonSchema, PersonRelationships } from "./schema";
import Animal from "../animal";

class Person extends RelationalDocument<
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
        ownerId: this.record._id
      })
    };
  }
}

export default Person;
