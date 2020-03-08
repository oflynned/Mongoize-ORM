import MemoryClient, {ConnectionOptions} from "../persistence/memory.client";
import User from "./models/user";

const main = async () => {
    // process.env.NODE_ENV = "development";

    const options: ConnectionOptions = {
        host: 'localhost',
        port: 27017,
        database: 'test'
    };

    const client: MemoryClient = new MemoryClient(options);
    const user = await new User().build({
        name: "John Smith",
        email: "email@test.com",
        password: "password"
    });
    console.log(user.toJson());

    const record = await user.save(client);
    console.log(record.toJson())
};

(async () => await main())();
