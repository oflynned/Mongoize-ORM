import Logger from "../logger";
import Animal from "./models/animal";
import Person from "./models/person";
import { bindGlobalDatabaseClient, InMemoryClient } from "../../src";

const printRelationship = (person: Person) => {
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

const main = async (): Promise<void> => {
  const person: Person = await new Person()
    .build({
      name: "John Smith"
    })
    .save();

  const doggo: Animal = await new Animal()
    .build({ name: "Doggo", legs: 4, ownerId: person.toJson()._id })
    .save();

  Logger.info(
    `${doggo.toJson().name} is owned by ${doggo.toJson().owner.toJson().name}`
  );

  // it updates internal references to fetch relationships
  // without calling this, the relationships are ___not___ refreshed
  // should probably be automatically called on calling a relational descendent in the first place
  await person.populate();
  printRelationship(person);

  const spot = await new Animal()
    .build({ name: "Spot", legs: 4, ownerId: person.toJson()._id })
    .save();
  await person.populate();
  printRelationship(person);

  await spot.update({ ownerId: undefined });
  Logger.info(
    `${doggo.toJson().name} is no longer owned by ${person.toJson().name}`
  );

  await person.populate();
  printRelationship(person);
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
