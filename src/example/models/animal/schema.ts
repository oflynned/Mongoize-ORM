import { Schema, Joi } from "../../../../src";
import { BaseModelType } from "../../../models/documents/base-document/schema";

export interface AnimalType extends BaseModelType {
  name: string;
  legs?: number;
}

export class AnimalSchema extends Schema<AnimalType> {
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
