import {
  DatabaseClient,
  RelationalDocument,
  Repository
} from "../../../../src";
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

  async relationalFields(
    depth: number,
    client: DatabaseClient
  ): Promise<PersonRelationships> {
    await super.relationalFields(depth, client);
    return {
      pets: await this._pets()
    };
  }

  private async _pets(): Promise<Animal[]> {
    return Repository.with(Animal).findMany(
      { ownerId: this.record._id },
      { populate: false }
    );
  }
}

export default Person;
