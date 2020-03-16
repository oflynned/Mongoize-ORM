import Logger from "../logger";
import Animal from "./models/animal";
import { InMemoryClient, Repository } from "../../src";

const main = async (client: InMemoryClient): Promise<void> => {
  const animal = await new Animal()
    .build({ name: "Doggo", legs: 4 })
    .save(client);

  Logger.info("I've been saved");
  Logger.info(animal.toJson());

  const count = await Repository.with(Animal).count(client);
  Logger.info(`There are ${count} record(s) in the db`);
};

(async (): Promise<void> => {
  const client = await new InMemoryClient().connect();
  try {
    await main(client);
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
})();
