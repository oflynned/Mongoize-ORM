import Logger from "../logger";
import Animal from "./models/animal";
import Person from "./models/person";
import { InMemoryClient } from "../../src";

const main = async (client: InMemoryClient): Promise<void> => {
  const person: Person = await new Person()
    .build({
      name: "John Smith"
    })
    .save(client);

  const animal: Animal = await new Animal()
    .build({ name: "Doggo", legs: 4, ownerId: person._id })
    .save(client);

  await animal.populate(client);
  Logger.info(
    `${animal.toJson().name} is owned by ${animal.toJson().owner.toJson().name}`
  );

  // should probably be automatically called on calling a relational descendent
  await person.populate(client);
  Logger.info(
    `${person.toJson().name} owns ${person.toJson().pets.length} pet(s)`
  );

  Logger.info(
    person
      .toJson()
      .pets.map((animal: Animal) => animal.toJson().name)
      .join(", ")
  );
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
