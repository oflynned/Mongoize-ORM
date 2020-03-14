import Joi from "joi";
import Schema from "../../../models/schema/schema.model";

export type IAnimal = {
  name: string;
  legs?: number;
};

export class AnimalSchema extends Schema<IAnimal> {
  joiSchema(): object {
    return {
      name: Joi.string().required(),
      legs: Joi.number().min(0)
    };
  }
}
