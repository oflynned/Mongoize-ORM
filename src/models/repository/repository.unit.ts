import Animal from "../../example/models/animal";
import Repository from "./index";
import { InMemoryClient } from "../../persistence/client";

describe("repository", () => {
  const client: InMemoryClient = new InMemoryClient();

  beforeAll(async () => {
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
  });

  describe("#existsById", () => {
    let animal: Animal;

    beforeAll(async () => {
      await client.dropDatabase();
      animal = await new Animal()
        .build({ name: "Doggo", legs: 4 })
        .save(client);
    });

    afterAll(async () => {
      await client.dropDatabase();
    });

    it("should return true", async () => {
      await expect(
        Repository.with(Animal).existsById(client, animal.toJson()._id)
      ).resolves.toBeTruthy();
    });

    it("should return false", async () => {
      await expect(
        Repository.with(Animal).existsById(client, "uuid does not exist")
      ).resolves.toBeFalsy();
    });
  });

  describe("#exists", () => {
    beforeAll(async () => {
      await client.dropDatabase();
    });

    afterAll(async () => {
      await client.dropDatabase();
    });

    describe("without empty db", () => {
      it("should return false", async () => {
        await expect(
          Repository.with(Animal).exists(client, {})
        ).resolves.toBeFalsy();
      });
    });

    describe("with fixture", () => {
      beforeAll(async () => {
        await new Animal().build({ name: "Doggo", legs: 4 }).save(client);
      });

      it("should return true with empty query", async () => {
        await expect(
          Repository.with(Animal).exists(client, {})
        ).resolves.toBeTruthy();
      });

      it("should return true", async () => {
        await expect(
          Repository.with(Animal).exists(client, { name: "Doggo" })
        ).resolves.toBeTruthy();
      });

      it("should return false", async () => {
        await expect(
          Repository.with(Animal).exists(client, { name: "Does not exist" })
        ).resolves.toBeFalsy();
      });
    });
  });
});
