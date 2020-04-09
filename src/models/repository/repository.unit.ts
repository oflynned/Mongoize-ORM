import Animal from "../../example/models/animal";
import { Repository } from "./repository";
import { InMemoryClient } from "../../persistence/client";
import { AnimalSchema, AnimalType } from "../../example/models/animal/schema";

describe("repository", () => {
  const client: InMemoryClient = new InMemoryClient();

  beforeAll(async () => {
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
  });

  describe("#with", () => {
    it("should return new repository instance", () => {
      const repo1 = Repository.with(Animal);
      const repo2 = Repository.with(Animal);
      expect(repo1 !== repo2).toBeTruthy();
    });
  });

  describe("#count", () => {
    beforeEach(async () => {
      await client.dropDatabase();
    });

    afterEach(async () => {
      await client.dropDatabase();
    });

    it("should return count 0 with no records", async () => {
      await expect(Repository.with(Animal).count(client)).resolves.toEqual(0);
    });

    it("should return count with populated records", async () => {
      await new Animal().build({ name: "Doggo", legs: 4 }).save(client);

      await expect(Repository.with(Animal).count(client)).resolves.toEqual(1);
    });

    it("should return count with record query", async () => {
      await new Animal().build({ name: "Doggo", legs: 4 }).save(client);

      await expect(
        Repository.with(Animal).count(client, { name: "Doggo" })
      ).resolves.toEqual(1);
    });
  });

  describe("#deleteCollection", () => {
    beforeEach(async () => {
      await client.dropDatabase();
    });

    afterEach(async () => {
      await client.dropDatabase();
    });

    it("should require collection to exist", async () => {
      await expect(
        Repository.with(Animal).deleteCollection(client)
      ).rejects.toBeDefined();
    });

    it("should drop collection", async () => {
      await new Animal().build({ name: "aaa" }).save(client);
      await expect(
        Repository.with(Animal).deleteCollection(client)
      ).resolves.toBeUndefined();
    });
  });

  describe("#updateOne", () => {
    let animal: Animal;

    beforeAll(async () => {
      await client.dropDatabase();
      animal = await new Animal()
        .build({ name: "Doggo", legs: 4 })
        .save(client);
      animal = await Repository.with<AnimalType, Animal, AnimalSchema>(
        Animal
      ).updateOne(client, animal.toJson()._id, { legs: 0 });
    });

    afterAll(async () => {
      await client.dropDatabase();
    });

    it("should not overwrite other keys", () => {
      expect(Object.keys(animal.toJson()).length).toBeGreaterThan(1);
    });

    it("should still contain property", function() {
      expect(animal.toJson()).toHaveProperty("legs");
    });

    it("should update record property value", async () => {
      expect(animal.toJson().legs).toEqual(0);
    });

    it("should obey joi schema", async () => {
      await expect(
        Repository.with(Animal).updateOne(client, animal.toJson()._id, {
          legs: -1
        })
      ).rejects.toThrowError();
    });

    describe("with untyped update", () => {
      let animal: Animal;

      beforeAll(async () => {
        await client.dropDatabase();
        animal = await new Animal()
          .build({ name: "Doggo", legs: 4 })
          .save(client);

        animal = await Repository.with(Animal).updateOne(
          client,
          animal.toJson()._id,
          {
            cool: "cool"
          }
        );
      });

      afterAll(async () => {
        await client.dropDatabase();
      });

      it("should apply migration property", () => {
        expect(animal.toJson()).toHaveProperty("cool");
      });
    });
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

  describe("#existsByQuery", () => {
    beforeAll(async () => {
      await client.dropDatabase();
    });

    afterAll(async () => {
      await client.dropDatabase();
    });

    describe("without empty db", () => {
      it("should return false", async () => {
        await expect(
          Repository.with(Animal).existsByQuery(client, {})
        ).resolves.toBeFalsy();
      });
    });

    describe("with fixture", () => {
      beforeAll(async () => {
        await new Animal().build({ name: "Doggo", legs: 4 }).save(client);
      });

      it("should return true with empty query", async () => {
        await expect(
          Repository.with(Animal).existsByQuery(client, {})
        ).resolves.toBeTruthy();
      });

      it("should return true", async () => {
        await expect(
          Repository.with(Animal).existsByQuery(client, { name: "Doggo" })
        ).resolves.toBeTruthy();
      });

      it("should return false", async () => {
        await expect(
          Repository.with(Animal).existsByQuery(client, {
            name: "Does not exist"
          })
        ).resolves.toBeFalsy();
      });
    });
  });

  describe("#exists", () => {
    beforeAll(async () => {
      await client.dropDatabase();
    });

    afterAll(async () => {
      await client.dropDatabase();
    });

    describe("with empty db", () => {
      it("should return false", async () => {
        const instance: Animal = new Animal().build({ name: "Doggo" });
        await expect(
          Repository.with(Animal).exists(client, instance)
        ).resolves.toBeFalsy();
      });
    });

    describe("with fixture", () => {
      let instance: Animal;

      beforeAll(async () => {
        instance = await new Animal().build({ name: "Doggo" }).save(client);
      });

      it("should return true with empty query", async () => {
        await expect(
          Repository.with(Animal).exists(client, instance)
        ).resolves.toBeTruthy();
      });

      it("should return true", async () => {
        await expect(
          Repository.with(Animal).exists(client, instance)
        ).resolves.toBeTruthy();
      });

      it("should return false", async () => {
        await instance.delete(client, { hard: true });
        await expect(
          Repository.with(Animal).exists(client, instance)
        ).resolves.toBeFalsy();
      });
    });
  });
});
