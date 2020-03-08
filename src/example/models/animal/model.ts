import Joi from "joi";
import Schema from "../../../models/schema/schema.model";
import BaseDocument from "../../../models/documents/base.document";

export type IAnimal = {
    name: string;
    legs?: number;
}

class AnimalSchema extends Schema<IAnimal> {
    joiSchema(): object {
        return {
            name: Joi.string().required(),
            legs: Joi.number().min(0)
        }
    }
}

export class Animal extends BaseDocument<IAnimal, AnimalSchema> {
    joiSchema(): AnimalSchema {
        return new AnimalSchema();
    }

    collection(): string {
        return "animals";
    }
}
