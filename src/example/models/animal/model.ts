import { BaseDocument } from "../../../../src";
import { AnimalType, AnimalSchema } from "./schema";

class Animal extends BaseDocument<AnimalType, AnimalSchema> {
  joiSchema(): AnimalSchema {
    return new AnimalSchema();
  }
}

export default Animal;
