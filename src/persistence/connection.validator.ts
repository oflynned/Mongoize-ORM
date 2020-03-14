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

export type ConnectionOptions = Partial<UriConnectionOptions> &
  Partial<AuthConnectionOptions>;

const parseUriString = (uri: string): ConnectionOptions => {
  const regex = new RegExp(
    /^(mongodb:(?:\/{2})?)((\w+?):(\w+?)@|:?@?)(\w+?):(\d+)\/(\w+?)$/
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

  return { uri, username, password, host, port: parseInt(port, 10), database };
};

export class ConnectionValidator {
  options: ConnectionOptions;

  validate(connection: ConnectionOptions): void {
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

    if (connection.username && connection.password) {
      const safeEncodedPassword = encodeURIComponent(connection.password);
      this.options = {
        uri: `mongodb://${connection.username}:${safeEncodedPassword}@${connection.host}:${connection.port}/${connection.database}`,
        ...connection
      };
      return;
    }

    this.options = {
      uri: `mongodb://${connection.host}:${connection.port}/${connection.database}`,
      ...connection
    };
  }
}
