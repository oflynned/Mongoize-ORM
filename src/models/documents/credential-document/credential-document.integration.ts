import { InMemoryClient } from "../../../persistence";
import User from "../../../example/models/user";
import { IUser } from "../../../example/models/user/schema";

describe("credential document", () => {
  const client: InMemoryClient = new InMemoryClient();
  const userParams: IUser = { email: "", name: "", password: "a" };

  beforeAll(async () => {
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
  });

  describe("#onPrePasswordHash", () => {
    it("should require at least 6 characters", async () => {
      const user = new User().build({ ...userParams, password: "a".repeat(5) });
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
});
