import { InMemoryClient } from "../../../persistence/client";
import User, { UserType } from "../../../example/models/user";
import sinon, { SinonSpy } from "sinon";

describe("credential-document", () => {
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

  describe("default properties", () => {
    const user: User = new User();

    it("should default to 12 hash cost rounds", () => {
      expect(user.saltRounds).toEqual(12);
    });

    it("should default to min password length of 6", () => {
      expect(user.minPlaintextPasswordLength).toEqual(6);
    });

    it("should default to max password length of 128", () => {
      expect(user.maxPlaintextPasswordLength).toEqual(128);
    });
  });

  describe("#passwordAttemptMatches", () => {
    describe("with a persisted user", () => {
      let user: User;

      beforeAll(async () => {
        user = await new User()
          .build({
            password: "plaintextPassword1!",
            name: "user",
            email: "user@email.com"
          })
          .save(client);
      });

      it("should not have a defined plaintext password", () => {
        expect(user.toJson().password).toBeUndefined();
      });

      it("should have a defined hash", () => {
        expect(user.toJson().passwordHash).toBeDefined();
      });

      it("should match password attempt", async () => {
        await expect(
          user.passwordAttemptMatches("plaintextPassword1!")
        ).resolves.toBeTruthy();
      });

      it("should not match password attempt", async () => {
        await expect(
          user.passwordAttemptMatches("bad password attempt")
        ).resolves.toBeFalsy();
      });
    });

    describe("with an un-persisted user", () => {
      const user: User = new User().build({
        password: "plaintextPassword1!",
        name: "user",
        email: "user@email.com"
      });

      it("should have a defined password", () => {
        expect(user.toJson().password).toBeDefined();
      });

      it("should have an undefined hash", () => {
        expect(user.toJson().passwordHash).toBeUndefined();
      });

      it("should resolve with false before persisting", async () => {
        await expect(
          user.passwordAttemptMatches("plaintextPassword1!")
        ).resolves.toBeFalsy();
      });
    });
  });

  describe("#onPrePasswordHash", () => {
    const userParams: UserType = { email: "", name: "", password: "a" };

    it("should require at least 6 characters", async () => {
      const user: User = new User().build({
        ...userParams,
        password: "a".repeat(5)
      });

      await expect(user.onPrePasswordHash()).rejects.toThrowError(
        "password is too short"
      );
    });

    it("should require at most 128 characters", async () => {
      const user = new User().build({
        ...userParams,
        password: "a".repeat(129)
      });
      await expect(user.onPrePasswordHash()).rejects.toThrowError(
        "password is too long"
      );
    });

    it("should reject weak password", async () => {
      const user = new User().build({ ...userParams, password: "password1" });
      await expect(user.onPrePasswordHash()).rejects.toThrowError(
        "password does not match minimum requirements"
      );
    });

    it("should require one number, one capital letter, one special character", async () => {
      const user = new User().build({
        ...userParams,
        password: "ZgZ9nHML3!ey"
      });
      await expect(user.onPrePasswordHash()).resolves.toBeUndefined();
    });
  });

  describe("#onPreValidate", () => {
    let user: User;
    let onPrePasswordHashSpy: SinonSpy, onPostPasswordHashSpy: SinonSpy;

    beforeAll(async () => {
      user = new User().build({
        password: "plaintextPassword1!",
        name: "user",
        email: "user@email.com"
      });

      onPrePasswordHashSpy = sinon.spy(user, "onPrePasswordHash");
      onPostPasswordHashSpy = sinon.spy(user, "onPostPasswordHash");

      await user.save(client);
    });

    it("should call onPrePasswordHash", async () => {
      expect(onPrePasswordHashSpy.calledOnce).toBeTruthy();
    });

    it("should call onPostPasswordHash", async () => {
      expect(onPostPasswordHashSpy.calledOnce).toBeTruthy();
    });
  });

  describe("#updatePassword", () => {
    let user: User;

    beforeAll(async () => {
      user = await new User()
        .build({
          password: "plaintextPassword1!",
          name: "user",
          email: "user@email.com"
        })
        .save(client);
      await user.updatePassword(client, "newPlaintextPassword1!");
    });

    it("should not match original password after update", async () => {
      await expect(
        user.passwordAttemptMatches("plaintextPassword1!")
      ).resolves.toBeFalsy();
    });

    it("should match new password after update", async () => {
      await expect(
        user.passwordAttemptMatches("newPlaintextPassword1!")
      ).resolves.toBeTruthy();
    });
  });
});
