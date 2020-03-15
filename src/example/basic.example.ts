import Logger from "../logger";
import Animal from "./models/animal";
import MongoClient, { ConnectionOptions } from "../persistence/mongo.client";

const main = async (client: MongoClient): Promise<void> => {
  const animal = await new Animal()
    .build({ name: "Doggo", legs: 4 })
    .save(client);

  Logger.info("I've been saved");
  Logger.info(animal.toJson());
};

(async (): Promise<void> => {
  const options: ConnectionOptions = {
    host: "localhost",
    port: 27017,
    database: "mongoize"
  };

  const client = await new MongoClient(options).connect();
  try {
    await main(client);
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
})();
