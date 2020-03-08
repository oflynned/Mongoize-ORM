import Logger from "../logger";
import Animal from "./models/animal";
import Person from "./models/person";
import MemoryClient, {ConnectionOptions} from "../persistence/memory.client";

const main = async () => {
    // process.env.NODE_ENV = "development";

    const options: ConnectionOptions = {
        host: 'localhost',
        port: 27017,
        database: 'test'
    };

    const client: MemoryClient = new MemoryClient(options);

    const animal = await new Animal()
        .build({name: 'Doggo', legs: 4})
        .save(client);

    const person = await new Person()
        .build({name: "John Smith"})
        .save(client);

    Logger.info(animal.toJson());
    await Animal.findMany(client);

    Logger.info(person.toJson());
    await Person.findMany(client);
};

(async () => await main())();
