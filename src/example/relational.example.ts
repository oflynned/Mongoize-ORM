import Logger from "../logger";
import Animal from "./models/animal";
import Person from "./models/person";
import { InMemoryClient, Repository } from "../index";

const main = async (client: InMemoryClient): Promise<void> => {
  await new Animal().build({ name: "Doggo", legs: 4 }).save(client);

  const animals = await Repository.with(Animal).findMany(client);
  Logger.info(animals);

  await new Person().build({ name: "John Smith" }).save(client);

  const people = await Repository.with(Person).findMany(client);
  Logger.info(people);
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
