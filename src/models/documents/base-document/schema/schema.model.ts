import Joi from "@hapi/joi";
import { v4 as uuid } from "uuid";

export type BaseModelType = {};

export type InternalModelType = {
  readonly _id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date | null;
  readonly deletedAt: Date | null;
  readonly deleted: boolean;
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

export abstract class Schema<T extends BaseModelType> {
  baseSchemaContent(): object {
    return {
      _id: uuid(),
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
      deleted: false
    };
  }

  validate(data: Omit<T, keyof InternalModelType>) {
    const joiSchema = Joi.object({ ...baseJoiSchema, ...this.joiBaseSchema() });
    return joiSchema.validate(data, { stripUnknown: true });
  }

  validateUpdate(data: Partial<Omit<T, keyof InternalModelType>>) {
    const joiSchema = Joi.object({ ...this.joiUpdateSchema() });
    return joiSchema.validate(data, { stripUnknown: true });
  }

  abstract joiBaseSchema(): object;

  abstract joiUpdateSchema(): object;
}
