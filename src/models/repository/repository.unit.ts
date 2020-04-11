import Animal from "../../example/models/animal";
import { Repository } from "./repository";
import { InMemoryClient } from "../../persistence/client";
import { AnimalSchema, AnimalType } from "../../example/models/animal/schema";
import { bindGlobalDatabaseClient } from "../../express";

describe("repository", () => {
  const client: InMemoryClient = new InMemoryClient();

  beforeAll(async () => {
    await bindGlobalDatabaseClient(client);
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
      await expect(Repository.with(Animal).count()).resolves.toEqual(0);
    });

    it("should return count with populated records", async () => {
      await new Animal().build({ name: "Doggo", legs: 4 }).save();

      await expect(Repository.with(Animal).count()).resolves.toEqual(1);
    });

    it("should return count with record query", async () => {
      await new Animal().build({ name: "Doggo", legs: 4 }).save();

      await expect(
        Repository.with(Animal).count({ name: "Doggo" })
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
        Repository.with(Animal).deleteCollection()
      ).rejects.toBeDefined();
    });

    it("should drop collection", async () => {
      await new Animal().build({ name: "aaa" }).save();
      await expect(
        Repository.with(Animal).deleteCollection()
      ).resolves.toBeUndefined();
    });
  });

  describe("#updateOne", () => {
    let animal: Animal;

    beforeAll(async () => {
      await client.dropDatabase();
      animal = await new Animal().build({ name: "Doggo", legs: 4 }).save();
      animal = await Repository.with<AnimalType, Animal, AnimalSchema>(
        Animal
      ).updateOne(animal.toJson()._id, { legs: 0 });
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
        Repository.with(Animal).updateOne(animal.toJson()._id, {
          legs: -1
        })
      ).rejects.toThrowError(/must be larger than or equal to 0/);
    });

    it("should not update non-existent record", async () => {
      await expect(
        Repository.with(Animal).updateOne("doesn't exist", { legs: 0 })
      ).rejects.toThrowError("instance does not exist");
    });

    describe("with no validation on update", () => {
      let animal: Animal;

      beforeAll(async () => {
        await client.dropDatabase();
        animal = await new Animal().build({ name: "Doggo", legs: 4 }).save();

        animal = await Repository.with(Animal).updateOne(
          animal.toJson()._id,
          {
            cool: "cool"
          },
          { validateUpdate: false }
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
      animal = await new Animal().build({ name: "Doggo", legs: 4 }).save();
    });

    afterAll(async () => {
      await client.dropDatabase();
    });

    it("should return true", async () => {
      await expect(
        Repository.with(Animal).existsById(animal.toJson()._id)
      ).resolves.toBeTruthy();
    });

    it("should return false", async () => {
      await expect(
        Repository.with(Animal).existsById("uuid does not exist")
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
          Repository.with(Animal).existsByQuery({})
        ).resolves.toBeFalsy();
      });
    });

    describe("with fixture", () => {
      beforeAll(async () => {
        await new Animal().build({ name: "Doggo", legs: 4 }).save();
      });

      it("should return true with empty query", async () => {
        await expect(
          Repository.with(Animal).existsByQuery({})
        ).resolves.toBeTruthy();
      });

      it("should return true", async () => {
        await expect(
          Repository.with(Animal).existsByQuery({ name: "Doggo" })
        ).resolves.toBeTruthy();
      });

      it("should return false", async () => {
        await expect(
          Repository.with(Animal).existsByQuery({
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
        const instance = new Animal().build({ name: "Doggo" });
        await expect(
          Repository.with(Animal).exists(instance)
        ).resolves.toBeFalsy();
      });
    });

    describe("with fixture", () => {
      let instance: Animal;

      beforeAll(async () => {
        instance = await new Animal().build({ name: "Doggo" }).save();
      });

      it("should return true with empty query", async () => {
        await expect(
          Repository.with(Animal).exists(instance)
        ).resolves.toBeTruthy();
      });

      it("should return true", async () => {
        await expect(
          Repository.with(Animal).exists(instance)
        ).resolves.toBeTruthy();
      });

      it("should return false", async () => {
        await instance.delete({ hard: true });
        await expect(
          Repository.with(Animal).exists(instance)
        ).resolves.toBeFalsy();
      });
    });
  });
});
