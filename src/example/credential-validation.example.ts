import MongoClient, {ConnectionOptions} from "../persistence/mongo.client";
import User from "./models/user";

const main = async (client: MongoClient) => {
    const user: User = await new User().build({
        name: "John Smith",
        email: "email@test.com",
        password: "password"
    });

    console.log(user);

    // contains plaintext password field, hash field is undefined
    console.log(user.toJson().password, user.toJson().passwordHash);
    const record = await user.save(client);
    console.log(record);

    // pre-validation hook scrubs the password field and sets the hashed field on the committed db record
    // console.log(record.toJson().password, record.toJson().passwordHash);

    // pre-validation hook also removes the .password field on the user instance since it should not be needed anymore
    // console.log(user.toJson().password, user.toJson().passwordHash);

    // we can also still compare credentials on the instance without direct password comparison
    // console.log('does this password attempt match?', await user.passwordAttemptMatches("not the password"));
    // console.log('does this password attempt match?', await user.passwordAttemptMatches("password"));
};

(async () => {
    const options: ConnectionOptions = {
        host: 'localhost',
        port: 27017,
        database: 'test'
    };

    const client = await new MongoClient(options).connect();
    await main(client);
    await client.close();
})();
