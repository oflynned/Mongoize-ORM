type UriConnectionOptions = {
  uri: string;
};

type AuthConnectionOptions = {
  username?: string;
  password?: string;
  host: string;
  port: number;
  database: string;
};

type EnvironmentOptions = {
  appendDatabaseEnvironment?: boolean;
};

export type ConnectionOptions = Partial<UriConnectionOptions> &
  Partial<AuthConnectionOptions> &
  Partial<EnvironmentOptions>;

const defaultOptions: ConnectionOptions = {
  appendDatabaseEnvironment: false
};

const parseUriString = (uri: string): ConnectionOptions => {
  const regex = new RegExp(
    /^(mongodb:(?:\/{2})?)((\w+?):(\w+?)@|:?@?)(\S+?):(\d+)\/(\S+?)(\?replicaSet=(\S+?))?$/
  );

  const fields = uri.split(regex);
  if (fields.length < 8) {
    throw new Error("bad connection string passed");
  }

  /**
     * [ '',
     'mongodb://',
     'username:password@',
     'username',
     'password',
     'host',
     '1234',
     'database',
     '' ]
     */
  const [, protocol, , username, password, host, port, database] = fields;

  // only supporting mongodb type
  if (protocol !== "mongodb://") {
    throw new Error("invalid protocol -- needs to be mongodb:// type");
  }

  // a connection string needs to have
  if (!(host || port || database)) {
    throw new Error("missing connection string field");
  }

  return {
    uri,
    username,
    password,
    host,
    port: parseInt(port, 10),
    database
  };
};

export class ConnectionValidator {
  options: ConnectionOptions;

  validate(connection: ConnectionOptions = defaultOptions): void {
    console.log(connection);
    if (connection.uri) {
      const { uri, username, password, host, port, database } = parseUriString(
        connection.uri
      );
      this.options = {
        uri,
        username,
        password,
        host,
        port,
        database
      };
      return;
    }

    const environment = (process.env.NODE_ENV || "development").toLowerCase();
    const database = connection.appendDatabaseEnvironment
      ? `${connection.database}-${environment}`
      : connection.database;

    if (connection.username && connection.password) {
      const safeEncodedPassword = encodeURIComponent(connection.password);
      this.options = {
        ...connection,
        uri: `mongodb://${connection.username}:${safeEncodedPassword}@${connection.host}:${connection.port}/${database}`,
        database
      };
      return;
    }

    this.options = {
      ...connection,
      uri: `mongodb://${connection.host}:${connection.port}/${database}`,
      database
    };
  }
}
