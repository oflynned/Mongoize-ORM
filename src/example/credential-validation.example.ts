import { InMemoryClient } from "../persistence";
import User from "./models/user";
import { Repository } from "../lib";

const main = async (client: InMemoryClient): Promise<void> => {
  await Repository.with(User).deleteMany(client);

  const user: User = await new User().build({
    name: "John Smith",
    email: "email@test.com",
    password: "password"
  });

  // contains plaintext password field, hash field is undefined
  console.log(user.toJson().password, user.toJson().passwordHash);

  // pre-validation hook scrubs the password field and sets the hashed field on the committed db record
  const record = await user.save(client);
  console.log(record.toJson().password, record.toJson().passwordHash);

  // pre-validation hook also removes the .password field on the user instance since it should not be needed anymore
  console.log(user.toJson().password, user.toJson().passwordHash);

  // we can also still compare credentials on the instance without direct password comparison
  console.log(
    "does this password attempt match?",
    await user.passwordAttemptMatches("not the password")
  );
  console.log(
    "does this password attempt match?",
    await user.passwordAttemptMatches("password")
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
