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

  const animal: Animal = await new Animal()
    .build({ name: "Doggo", legs: 4, ownerId: person.toJson()._id })
    .save();

  Logger.info(
    `${animal.toJson().name} is owned by ${animal.toJson().owner.toJson().name}`
  );

  // it updates internal references to fetch relationships
  // without calling this, the relationships are ___not___ refreshed
  // should probably be automatically called on calling a relational descendent in the first place
  await person.populate();
  printRelationship(person);

  await new Animal()
    .build({ name: "Spot", legs: 4, ownerId: person.toJson()._id })
    .save();
  await person.populate();
  printRelationship(person);

  await animal.update({ ownerId: undefined });
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
