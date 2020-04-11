import Animal from "../animal";
import { Schema, Joi, BaseModelType } from "../../../../src";
import { BaseRelationshipType } from "../../../document/base-document/schema";

export interface PersonType extends BaseModelType {
  name: string;
}

export interface PersonRelationships extends BaseRelationshipType {
  pets: Animal[];
}

export class PersonSchema extends Schema<PersonType> {
  joiBaseSchema(): object {
    return {
      name: Joi.string().required()
    };
  }

  joiUpdateSchema(): object {
    return {
      name: Joi.string()
    };
  }
}
