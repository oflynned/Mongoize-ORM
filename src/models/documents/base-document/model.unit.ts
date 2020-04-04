import Animal from "../../../example/models/animal";
import { InMemoryClient } from "../../../persistence/client";

describe("base-document", () => {
  let client: InMemoryClient;

  beforeAll(async () => {
    client = await new InMemoryClient().connect();
  });

  beforeEach(async () => {
    await client.dropDatabase();
  });

  afterEach(async () => {
    await client.dropDatabase();
  });

  afterAll(async () => {
    await client.close();
  });

  describe("#toJSON", () => {
    let model: Animal;

    beforeAll(async () => {
      model = await new Animal().build({ name: "Name" }).save(client);
    });

    it("should contain default properties", () => {
      expect(Object.keys(model.toJson()).sort()).toEqual(
        ["_id", "updatedAt", "deletedAt", "deleted", "createdAt", "name"].sort()
      );
    });

    describe("._id", () => {
      it("should be populated on build", () => {
        expect(model.toJson()._id).toBeDefined();
      });

      it("should be a v4 uuid", () => {
        expect(model.toJson()._id).toMatch(
          /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
        );
      });
    });

    describe(".createdAt", () => {
      it("should populate with a timestamp", () => {
        expect(model.toJson().createdAt).toBeDefined();
      });
    });

    describe(".updatedAt", () => {
      it("should default to null", () => {
        expect(model.toJson().updatedAt).toBeNull();
      });
    });

    describe(".deleted", () => {
      it("should default to false", () => {
        expect(model.toJson().deleted).toBeFalsy();
      });
    });

    describe(".deletedAt", () => {
      it("should default to null", () => {
        expect(model.toJson().deletedAt).toBeNull();
      });
    });
  });

  describe("#build", () => {
    let model: Animal;

    beforeAll(async () => {
      model = await new Animal().build({ name: "Name" }).save(client);
    });

    it("should be undefined before #build", () => {
      expect(new Animal().toJson()).toBeUndefined();
    });

    it("should build model", () => {
      expect(model.toJson()).not.toBeUndefined();
    });
  });

  describe("#collection", () => {
    let model: Animal;

    beforeAll(async () => {
      model = await new Animal();
    });

    it("should default to appending s", () => {
      expect(model.collection()).toEqual(
        model.constructor.name.toLowerCase() + "s"
      );
    });
  });

  describe("#update", () => {
    let model: Animal;

    beforeAll(async done => {
      model = await new Animal().build({ name: "test" }).save(client);
      await model.update(client, { name: "not test" });
      done();
    });

    it("should require at least one field in payload", () => {
      expect(model.update(client, {})).rejects.toThrowError("payload is empty");
    });

    it("should update field", () => {
      expect(model.toJson().name).toEqual("not test");
    });

    it("should update .updatedAt field", function() {
      expect(model.toJson().updatedAt).not.toBeNull();
    });
  });

  describe("#delete", () => {
    it("should throw error on deleting a record that doesn't exist", () => {
      expect(new Animal().delete(client)).rejects.toThrowError();
    });

    describe("with hard delete", () => {
      let model: Animal;

      beforeAll(async done => {
        model = await new Animal().build({ name: "test" }).save(client);
        await model.delete(client, { hard: true });
        done();
      });

      it("should hard delete", () => {
        expect(model.toJson()).toBeUndefined();
      });
    });

    describe("with soft delete", () => {
      let model: Animal;

      beforeAll(async done => {
        model = await new Animal().build({ name: "test" }).save(client);
        await model.delete(client, { hard: false });
        done();
      });

      it("should not hard delete", () => {
        expect(model).toBeDefined();
        expect(model.toJson()).toBeDefined();
      });

      it("should set .deleted flag", () => {
        expect(model.toJson().deleted).toBeTruthy();
      });

      it("should set deletedAt field", () => {
        expect(model.toJson().deletedAt).not.toBeNull();
      });
    });
  });
});
