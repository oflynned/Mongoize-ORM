import Joi from 'joi';
import {v4 as uuid} from 'uuid';

interface ISchema {
    joiSchema(): Joi.ObjectSchema;
}

interface IBaseModel {
    _id: string;
    createdAt: number;
    updatedAt: number | null;
}

const baseJoiSchema = {
    _id: Joi.string().required(),
    createdAt: Joi.number().required(),
    updatedAt: Joi.number().allow(null).required()
};

abstract class Schema<T> implements ISchema {
    baseSchemaContent(): object {
        return {
            _id: uuid(),
            createdAt: new Date(),
            updatedAt: null
        };
    }

    validate(data: IBaseModel | T) {
        const joiSchema = Joi.object({...baseJoiSchema, ...this.joiSchema()});
        return Joi.validate(data, joiSchema);
    }

    abstract joiSchema(): Joi.ObjectSchema;
}

export default Schema;
