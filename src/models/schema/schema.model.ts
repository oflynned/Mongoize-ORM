import Joi from "joi";
import { v4 as uuid } from "uuid";

export type IBaseModel = {
  _id: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
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
    const joiSchema = Joi.object({ ...baseJoiSchema, ...this.joiBaseSchema() });
    return Joi.validate(data, joiSchema, { stripUnknown: true });
  }

  validateOnUpdate(data: IBaseModel | Partial<T>) {
    const joiSchema = Joi.object({ ...this.joiUpdateSchema() });
    return Joi.validate(data, joiSchema, { stripUnknown: true });
  }

  abstract joiBaseSchema(): object;

  abstract joiUpdateSchema(): object;
}

export default Schema;
