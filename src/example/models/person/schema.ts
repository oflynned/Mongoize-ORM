import Animal from "../animal";
import { Schema, Joi } from "../../../../src";

export type IPerson = {
  name: string;
  pet?: Animal;
};

export class PersonSchema extends Schema<IPerson> {
  joiBaseSchema(): object {
    return {
      name: Joi.string().required(),
      pet: Joi.string().uuid()
    };
  }

  joiUpdateSchema(): object {
    return {
      name: Joi.string(),
      pet: Joi.string().uuid()
    };
  }
}
