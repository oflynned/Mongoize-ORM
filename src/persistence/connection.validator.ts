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
            // TODO should split uri into auth connections options style with regex instead and throw an error
            //      in the case of passing a non-numeric port number
            return connection.uri;
        }

        if (connection.username && connection.password) {
            const safeEncodedPassword = encodeURIComponent(connection.password);
            return `mongodb://${connection.username}:${safeEncodedPassword}@${connection.host}:${connection.port}/${connection.database}`
        }

        return `mongodb://${connection.host}:${connection.port}/${connection.database}`
    }
}
