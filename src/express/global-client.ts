import { DatabaseClient, ConnectionOptions } from "../";

/* eslint-disable */
declare global {
  namespace NodeJS {
    interface Global {
      databaseClient: DatabaseClient;
    }
  }
}
/* eslint-enable */

export async function bindGlobalDatabaseClient(
  client: DatabaseClient,
  options?: ConnectionOptions
): Promise<DatabaseClient> {
  global.databaseClient = await client.connect(options);
  return global.databaseClient;
}
