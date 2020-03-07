import Joi from 'joi';
import BaseDocument from "../src/models/documents/base.document";
import Schema from "../src/models/schema/schema.model";

type IAnimal = {
    name: string;
    legs?: number;
}

class AnimalSchema extends Schema<IAnimal> {
    joiSchema(): Joi.ObjectSchema {
        return Joi.object({
            name: Joi.string().required(),
            legs: Joi.number().min(0)
        });
    }
}

class Animal extends BaseDocument<IAnimal, AnimalSchema> {
    joiSchema(): AnimalSchema {
        return new AnimalSchema();
    }
}

const main = async () => {
    const animal = await new Animal()
        .build({
            name: "Doggo",
            legs: 4
        })
        .save();

    console.log("\nI've been saved");
    console.log(animal.toJson());

    await animal.update({legs: 3});
    console.log("\nI've been updated");
    console.log(animal.toJson());
};

(async () => await main())();
