import Logger from "../logger";
import Animal from "./models/animal";
import { InMemoryClient, Repository } from "../../src";

const main = async (client: InMemoryClient): Promise<void> => {
  const animal = await new Animal()
    .build({ name: "Doggo", legs: 4 })
    .save(client);

  Logger.info("I've been created");
  Logger.info(animal);

  await animal.update(client, { legs: 3 });
  Logger.info("I've been updated");
  Logger.info(animal);

  try {
    await animal.update(client, { legs: -1 });
  } catch (e) {
    Logger.info("A bad update wasn't committed!");
    Logger.info(animal);
  }

  await animal.delete(client);
  Logger.info("I've been soft deleted");
  Logger.info(animal);

  const a: Animal = await Repository.with(Animal).findById(
    client,
    animal.toJson()._id
  );
  Logger.info("I've been read");
  Logger.info(a);

  await a.delete(client, { hard: true });
  Logger.info("I've been hard deleted");

  // returns false as it's two separate deep clones of the same instance from the db
  Logger.info("are a and animal the same instance?", a === animal);
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
