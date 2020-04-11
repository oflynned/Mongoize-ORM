import Logger from "../logger";
import Animal from "./models/animal";
import { InMemoryClient, Repository } from "../../src";
import { bindGlobalDatabaseClient } from "../express";

const main = async (): Promise<void> => {
  const animal: Animal = await new Animal()
    .build({ name: "Doggo", legs: 4 })
    .save();

  Logger.info("I've been saved");
  Logger.info(animal.toJson());

  const count = await Repository.with(Animal).count();
  Logger.info(`There are ${count} record(s) in the db`);
};

(async (): Promise<void> => {
  const client = await bindGlobalDatabaseClient(new InMemoryClient());
  try {
    await main();
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
})();
