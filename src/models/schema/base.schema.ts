import Joi from 'joi';
import {v4 as generateUuid} from 'uuid';

class BaseSchema {
    static schema(): object {
        return Joi.object({
            _id: generateUuid(),
            createdAt: Joi.number().default(Date.now()).required(),
            updatedAt: Joi.number().allow(null)
        });
    }
}

export default BaseSchema;
