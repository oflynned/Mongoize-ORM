import { MongoClient } from "./mongo.client";
import { MongoMemoryServer } from "mongodb-memory-server";

class InMemoryClient extends MongoClient {
  private mongoServer: MongoMemoryServer;

  async connect(): Promise<InMemoryClient> {
    const uri = await this.setupDbServer();
    await super.connect({ uri });
    return this;
  }

  async close(): Promise<InMemoryClient> {
    await super.close();
    await this.tearDownDbServer();
    return this;
  }

  private async setupDbServer(): Promise<string> {
    this.mongoServer = new MongoMemoryServer();
    return await this.mongoServer.getUri();
  }

  private async tearDownDbServer(): Promise<void> {
    await this.mongoServer.stop();
  }
}

export { InMemoryClient };
