type UriConnectionOptions = {
  uri: string;
};

type AuthConnectionOptions = {
  username?: string;
  password?: string;
  host: string;
  port?: number;
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
  // only supporting mongodb and mongodb+srv protocols
  if (!(uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"))) {
    throw new Error(
      "invalid protocol -- needs to be mongodb:// or mongodb+srv:// type"
    );
  }

  let fields;
  if (uri.startsWith("mongodb://")) {
    const regex = new RegExp(
      /^(mongodb:(?:\/{2})?)((\w+?):(\w+?)@|:?@?)(\S+?):(\d+)\/(\S+?)(\?replicaSet=(\S+?))?$/
    );
    fields = uri.split(regex);
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
    const [, , , username, password, host, port, database] = fields;
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
  }

  const regex = new RegExp(
    /^(mongodb\+srv:(?:\/{2})?)((\w+?):(\w+?)@|:?@?)(\S+?)\/(\S+?)(\?replicaSet=(\S+?))?$/
  );
  fields = uri.split(regex);
  if (fields.length <= 1) {
    throw new Error("bad connection string passed");
  }

  /**
     * [ '',
     'mongodb+srv://',
     'user:password@',
     'user',
     'password',
     'host',
     'database',
     undefined,
     undefined,
     '' ]
     */
  const [, , , username, password, host, database] = fields;
  if (!(host || database)) {
    throw new Error("missing connection string field");
  }

  return {
    uri: `mongodb+srv://${username}:${password}@${host}/${database}`,
    username,
    password,
    host,
    database
  };
};

export class ConnectionValidator {
  options: ConnectionOptions;

  validate(connection: ConnectionOptions = defaultOptions): void {
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

    if (!connection.database) {
      throw new Error("database is required");
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
