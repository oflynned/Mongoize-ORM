import Joi from "joi";
import { v4 as uuid } from "uuid";

export type IBaseModel = {
  _id: string;
  createdAt: number;
  updatedAt: number | null;
  deletedAt: number | null;
  deleted: boolean;
};

const baseJoiSchema = {
  _id: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date()
    .allow(null)
    .required(),
  deletedAt: Joi.date()
    .allow(null)
    .required(),
  deleted: Joi.boolean().required()
};

abstract class Schema<T> {
  baseSchemaContent(): object {
    return {
      _id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
      deleted: false
    };
  }

  validate(data: IBaseModel | T) {
    const joiSchema = Joi.object({ ...baseJoiSchema, ...this.joiSchema() });
    return Joi.validate(data, joiSchema, { stripUnknown: true });
  }

  abstract joiSchema(): object;
}

export default Schema;
