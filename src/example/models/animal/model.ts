import { BaseDocument } from "../../../../src";
import { IAnimal, AnimalSchema } from "./schema";

class Animal extends BaseDocument<IAnimal, AnimalSchema> {
  joiSchema(): AnimalSchema {
    return new AnimalSchema();
  }
}

export default Animal;
