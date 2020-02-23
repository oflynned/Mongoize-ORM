import {ConnectionOptions, ConnectionValidator} from "./connection.validator";

describe('Connection Validator', () => {
    const validator: ConnectionValidator = new ConnectionValidator();

    describe("validate", () => {
        describe("with uri", () => {
            it('should validate uri', () => {
                const options: ConnectionOptions = {
                    uri: "mongodb://username:password@host:1234/database"
                };
                expect(validator.validate(options)).toEqual("mongodb://username:password@host:1234/database")
            });

            xit('should throw error on invalid port', function () {
                const options: ConnectionOptions = {
                    uri: "mongodb://username:password@host:port/database"
                };
                expect(validator.validate(options)).toThrowError(Error("invalid connection option"))
            });
        });

        describe('with auth', function () {
            it('should validate without username and password', function () {
                const options: ConnectionOptions = {
                    host: "host",
                    port: 1234,
                    database: "database"
                };
                expect(validator.validate(options)).toEqual("mongodb://host:1234/database")
            });

            it('should validate with username and password', function () {
                const options: ConnectionOptions = {
                    username: "username",
                    password: "password",
                    host: "host",
                    port: 1234,
                    database: "database"
                };
                expect(validator.validate(options)).toEqual("mongodb://username:password@host:1234/database")
            });

            it('should require both username and password to prefill connection uri', function () {
                const options: ConnectionOptions = {
                    host: "host",
                    port: 1234,
                    database: "database"
                };
                expect(validator.validate({username: "username", ...options})).toEqual("mongodb://host:1234/database");
                expect(validator.validate({password: "password", ...options})).toEqual("mongodb://host:1234/database")
            });
        });

        it('should prefer uri string', function () {
            const options: ConnectionOptions = {
                uri: "mongodb://username:password@host:port/database",
                username: "username1",
                password: "password1",
                host: "host1",
                port: 12345,
                database: "database1"
            };
            expect(validator.validate(options)).toEqual("mongodb://username:password@host:port/database")
        });
    });
});
