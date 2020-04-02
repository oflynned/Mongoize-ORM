import { BaseDocument } from "../../../../src";
import { IAnimal, AnimalSchema } from "./schema";

class Animal extends BaseDocument<IAnimal, AnimalSchema> {
  joiSchema(): AnimalSchema {
    return new AnimalSchema();
  }

  async something(): Promise<string> {
    return "something";
  }
}

export default Animal;
