import Logger from "../logger";
import Animal from "./models/animal";
import Person from "./models/person";
import MongoClient, { ConnectionOptions } from "../persistence/mongo.client";
import Repository from "../models/documents/repository";

const main = async (client: MongoClient): Promise<void> => {
  await new Animal().build({ name: "Doggo", legs: 4 }).save(client);

  const animals = await Repository.findMany(Animal, client);
  Logger.info(animals);

  await new Person().build({ name: "John Smith" }).save(client);

  const people = await Repository.findMany(Person, client);
  Logger.info(people);
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
