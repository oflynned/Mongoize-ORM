import Logger from "../logger";
import Animal from "./models/animal";
import Person from "./models/person";
import { InMemoryClient, Repository } from "../../src";

const main = async (client: InMemoryClient): Promise<void> => {
  await new Animal().build({ name: "Doggo", legs: 4 }).save(client);

  const animals = await Repository.with(Animal).findAll(client);
  // Logger.info(animals);

  const person = await new Person().build({
    name: "John Smith",
    pet: animals[0]
  });

  Logger.info(
    `${person.toJson().name} is the owner of ${
      person.toJson().pet.toJson().name
    }`
  );

  // const p2 = await p1.save(client);
  // Logger.info(p2);

  // const people = await Repository.with(Person).findMany(client);
  // Logger.info(people);
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
