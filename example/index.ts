import Joi from 'joi';
import BaseDocument from "../src/models/documents/base.document";
import Schema from "../src/models/schema/schema.model";

type IAnimal = {
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

class Animal extends BaseDocument<IAnimal, AnimalSchema> {
    joiSchema(): AnimalSchema {
        return new AnimalSchema();
    }

    onPreValidate(): void {
        super.onPreValidate();
        // super.record.legs = 1;
    }
}

const main = async () => {
    const payload: IAnimal = {name: 'Doggo', legs: 4};
    const animal = await new Animal()
        .build(payload)
        .save();

    console.log("\nI've been saved\n");
    console.log(animal.toJson());

    await animal.update({legs: 3});
    console.log("\nI've been updated\n");
    console.log(animal.toJson());

    try {
        await animal.update({legs: -1});
    } catch (e) {
        console.log("\nbad update wasn't made!\n");
        console.log(animal.toJson());
    }

    await animal.delete();
    console.log("\nI've been soft deleted\n");
    console.log(animal.toJson());

    await animal.delete(true);
    console.log("\nI've been hard deleted\n");
    console.log(animal.toJson());
};

(async () => await main())();
