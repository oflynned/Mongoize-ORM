import Logger from "../logger";
import Animal from "./models/animal";
import {
  bindGlobalDatabaseClient,
  InMemoryClient,
  Repository
} from "../../src";

const main = async (): Promise<void> => {
  const animal = await new Animal().build({ name: "Doggo", legs: 4 }).save();

  Logger.info("I've been created");
  Logger.info(animal);

  await animal.update({ legs: -1 });
  Logger.info("I've been updated");
  Logger.info(animal);

  try {
    await animal.update({ legs: -1 });
  } catch (e) {
    Logger.info("A bad update wasn't committed!");
    Logger.info(animal);
  }

  await animal.delete();
  Logger.info("I've been soft deleted");
  Logger.info(animal);

  const a: Animal = await Repository.with(Animal).findById(animal.toJson()._id);

  Logger.info("I've been read");
  Logger.info(a);

  await a.delete({ hard: true });
  Logger.info("I've been hard deleted");
  Logger.info(a);
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
