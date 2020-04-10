import { Schema, Joi, BaseModelType } from "../../../../src";
import Person from "../person";
import { BaseRelationshipType } from "../../../models/documents/base-document/schema";

export interface AnimalType extends BaseModelType {
  name: string;
  legs?: number;
  ownerId?: string;
}

export interface AnimalRelationships extends BaseRelationshipType {
  owner?: Person;
}

export class AnimalSchema extends Schema<AnimalType> {
  joiBaseSchema(): object {
    return {
      name: Joi.string().required(),
      legs: Joi.number().min(0),
      ownerId: Joi.string().uuid()
    };
  }

  joiUpdateSchema(): object {
    return {
      name: Joi.string(),
      legs: Joi.number().min(0),
      ownerId: Joi.string().uuid()
    };
  }
}
