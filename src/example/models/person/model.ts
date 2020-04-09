import { BaseDocument } from "../../../../src";
import { PersonType, PersonSchema } from "./schema";

class Person extends BaseDocument<PersonType, PersonSchema> {
  joiSchema(): PersonSchema {
    return new PersonSchema();
  }

  collection(): string {
    return "people";
  }
}

export default Person;
