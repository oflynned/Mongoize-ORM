import BaseDocument from "../../../models/documents/base.document";
import { IAnimal, AnimalSchema } from "./schema";

class Animal extends BaseDocument<IAnimal, AnimalSchema> {
  joiSchema(): AnimalSchema {
    return new AnimalSchema();
  }

  collection(): string {
    return "animals";
  }
}

export default Animal;
