import { BaseDocument } from "../../../../src";
import { IPerson, PersonSchema } from "./schema";

class Person extends BaseDocument<IPerson, PersonSchema> {
  joiSchema(): PersonSchema {
    return new PersonSchema();
  }

  collection(): string {
    return "people";
  }
}

export default Person;
