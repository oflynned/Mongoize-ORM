import { Schema, Joi } from "../../../../src";

export type IAnimal = {
  name: string;
  legs?: number;
};

export class AnimalSchema extends Schema<IAnimal> {
  joiBaseSchema(): object {
    return {
      name: Joi.string().required(),
      legs: Joi.number().min(0)
    };
  }

  joiUpdateSchema(): object {
    return {
      name: Joi.string(),
      legs: Joi.number().min(0)
    };
  }
}
