import Logger from "../logger";
import Animal from "./models/animal";
import Person from "./models/person";
import { InMemoryClient, Repository } from "../../src";

const main = async (client: InMemoryClient): Promise<void> => {
  const person: Person = await new Person()
    .build({
      name: "John Smith"
    })
    .save(client);

  const animal: Animal = await new Animal()
    .build({ name: "Doggo", legs: 4, ownerId: person._id })
    .save(client);

  const a: Animal = await Repository.with(Animal).findById(client, animal._id);

  Logger.info(
    `${a.toJson().name} is owned by ${a.toPopulatedJson().owner.toJson().name}`
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
