import Logger from "../logger";
import Animal from "./models/animal";
import MemoryClient, {ConnectionOptions} from "../persistence/memory.client";

const main = async () => {
    process.env.NODE_ENV = "development";

    const options: ConnectionOptions = {
        host: 'localhost',
        port: 27017,
        database: 'test'
    };

    const client: MemoryClient = new MemoryClient(options);

    const animal = await new Animal()
        .build({name: 'Doggo', legs: 4})
        .save(client);

    Logger.info("I've been saved");
    Logger.info(animal.toJson());
};

(async () => await main())();
