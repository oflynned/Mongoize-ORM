import Logger from "../logger";
import Animal from "./models/animal";
import {
  bindGlobalDatabaseClient,
  InMemoryClient,
  Repository
} from "../../src";

const main = async (): Promise<void> => {
  const animal: Animal = await new Animal()
    .build({ name: "Doggo", legs: 4 })
    .save();

  Logger.info("I've been created");
  Logger.info(animal);

  await animal.update({ legs: 3 });
  Logger.info("I've been updated");
  Logger.info(animal);

  console.log(animal.toJson().legs); // should be 3
  await Repository.with(Animal).updateOne(animal.toJson()._id, { legs: 4 });
  console.log(animal.toJson().legs); // should be 3
  await animal.refresh();
  console.log(animal.toJson().legs); // should be 4

  try {
    await animal.update({ legs: -1 });
  } catch (e) {
    Logger.info("A bad update wasn't committed!");
    Logger.info(animal);
  }

  await animal.softDelete();
  Logger.info("I've been soft deleted");
  Logger.info(animal);

  const a: Animal = await Repository.with(Animal).findById(animal.toJson()._id);

  Logger.info("I've been read");
  Logger.info(a);

  await a.hardDelete();
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
