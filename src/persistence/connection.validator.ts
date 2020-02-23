type UriConnectionOptions = {
    uri: string;
}

type AuthConnectionOptions = {
    username?: string;
    password?: string;
    host: string;
    port: number;
    database: string;
}

export type ConnectionOptions = Partial<UriConnectionOptions> & Partial<AuthConnectionOptions>;

export class ConnectionValidator {
    validate(connection: ConnectionOptions): string {
        if (connection.uri) {
            return connection.uri;
        }

        if (connection.username && connection.password) {
            return `mongodb://${connection.username}:${connection.password}@${connection.host}:${connection.port}/${connection.database}`
        }

        return `mongodb://${connection.host}:${connection.port}/${connection.database}`
    }
}
