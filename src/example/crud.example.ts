import Logger from "../logger";
import Animal from "./models/animal";
import MemoryClient, {ConnectionOptions} from "../persistence/memory.client";

const main = async () => {
    // process.env.NODE_ENV = "development";

    const options: ConnectionOptions = {
        host: 'localhost',
        port: 27017,
        database: 'test'
    };

    const client: MemoryClient = new MemoryClient(options);

    // TODO move this to some global initialisation level as this is cumbersome to inject the client at every usage
    const animal = await new Animal()
        .build({name: 'Doggo', legs: 4})
        .save(client, new Animal().collection());

    Logger.info("I've been created");
    Logger.info(animal.toJson());

    // TODO change this, overriding collectionName() as a static method messes with the parent value
    //      it changes the value to function -> functions instead of taking the actual override or constructor name value
    //      the user should not have to pass an instance of the class to the static method
    const animals = await Animal.findMany(client, animal.collection());
    Logger.info("I've been read");
    Logger.info(animals);

    await animal.update({legs: 3});
    Logger.info("I've been updated");
    Logger.info(animal.toJson());

    try {
        await animal.update({legs: -1});
    } catch (e) {
        Logger.info("A bad update wasn't committed!");
        Logger.info(animal.toJson());
    }

    await animal.delete();
    Logger.info("I've been soft deleted");
    Logger.info(animal.toJson());

    await animal.delete({hard: true});
    Logger.info("I've been hard deleted");
    Logger.info(animal.toJson());
};

(async () => await main())();
