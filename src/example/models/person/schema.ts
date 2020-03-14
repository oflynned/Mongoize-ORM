import Joi from "joi";
import Animal from "../animal";
import Schema from "../../../models/schema/schema.model";

export type IPerson = {
  name: string;
  pets?: Animal[];
};

export class PersonSchema extends Schema<IPerson> {
  joiSchema(): object {
    return {
      name: Joi.string().required(),
      pets: Joi.array().items(Joi.string().uuid())
    };
  }
}
