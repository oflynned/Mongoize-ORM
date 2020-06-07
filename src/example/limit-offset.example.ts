import Logger from "../logger";
import Animal from "./models/animal";
import { InMemoryClient, Repository } from "../../src";
import { bindGlobalDatabaseClient } from "../express";

const main = async (): Promise<void> => {
  await new Animal().build({ name: "Doggo 1", legs: 4 }).save();
  await new Animal().build({ name: "Doggo 2", legs: 4 }).save();
  await new Animal().build({ name: "Doggo 3", legs: 4 }).save();
  await new Animal().build({ name: "Doggo 4", legs: 4 }).save();
  await new Animal().build({ name: "Doggo 5", legs: 4 }).save();

  const count = await Repository.with(Animal).count();
  Logger.info(`There are ${count} record(s) in the db`);

  const records = await Repository.with(Animal).findMany(
    {},
    { limit: 2, offset: 1 }
  );
  records.map((animal: Animal) => {
    console.log(animal.toJson());
  });

  Logger.info(`There are ${records.length} record(s) returned in the query`);
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
