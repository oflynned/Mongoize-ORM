import BaseDocument from "../../../models/documents/base.document";
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
