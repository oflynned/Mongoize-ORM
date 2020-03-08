import Joi from 'joi';
import BaseDocument from "../src/models/documents/base.document";
import Schema from "../src/models/schema/schema.model";
import Logger from "../src/logger";

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
}

type IPerson = {
    name: string;
    pets?: Animal[];
}

class PersonSchema extends Schema<IPerson> {
    joiSchema(): object {
        return {
            name: Joi.string().required(),
            pets: Joi.array().items(Joi.string().uuid())
        }
    }
}

class Person extends BaseDocument<IPerson, PersonSchema> {
    joiSchema(): PersonSchema {
        return new PersonSchema();
    }

    collection(): string {
        return "people";
    }
}

const main = async () => {
    process.env.NODE_ENV = "development";

    const payload: IAnimal = {name: 'Doggo', legs: 4};
    const animal = await new Animal()
        .build(payload)
        .save();

    Logger.info("I've been saved");
    Logger.info(animal.toJson());

    const person = await new Person()
        .build({name: "John Smith"})
        .save();

    Logger.info(person.toJson())

    // await animal.update({legs: 3});
    // Logger.info("I've been updated");
    // Logger.info(animal.toJson());
    //
    // try {
    //     await animal.update({legs: -1});
    // } catch (e) {
    //     Logger.info("A bad update wasn't committed!");
    //     Logger.info(animal.toJson());
    // }
    //
    // await animal.delete();
    // Logger.info("I've been soft deleted");
    // Logger.info(animal.toJson());
    //
    // await animal.delete({hard: true});
    // Logger.info("I've been hard deleted");
    // Logger.info(animal.toJson());
};

(async () => await main())();
