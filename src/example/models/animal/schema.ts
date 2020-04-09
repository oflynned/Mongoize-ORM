import { Schema, Joi } from "../../../../src";
import { IBaseModel } from "../../../models/documents/base-document/schema";

export interface IAnimal extends IBaseModel {
  name: string;
  legs?: number;
}

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
