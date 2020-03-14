import { ConnectionOptions } from "./connection.validator";

// TODO replace this with a faux-mongodb interface via npm
//      otherwise it's not possible to pass the same queries
class MemoryClient {}

export { ConnectionOptions };

export default MemoryClient;
