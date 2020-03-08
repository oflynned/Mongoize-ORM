import Logger from "../logger";
import Animal from "./models/animal";
import Person from "./models/person";
import {ConnectionOptions} from "../persistence/connection.validator";
import MemoryClient from "../persistence/memory.client";

const main = async () => {
    process.env.NODE_ENV = "development";

    const options: ConnectionOptions = {
        host: 'localhost',
        port: 27017,
        database: 'test'
    };

    const client: MemoryClient = new MemoryClient(options);

    const animal = await new Animal(client)
        .build({name: 'Doggo', legs: 4})
        .save();

    const person = await new Person(client)
        .build({name: "John Smith"})
        .save();

    Logger.info(animal.toJson());
    Logger.info(person.toJson());
};

(async () => await main())();
