import {ConnectionOptions, ConnectionValidator} from "./connection.validator";

describe('Connection Validator', () => {
    const validator: ConnectionValidator = new ConnectionValidator();
    const baseOptions: ConnectionOptions = {
        host: "host",
        port: 1234,
        database: "database"
    };

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
                expect(validator.validate(baseOptions)).toEqual("mongodb://host:1234/database")
            });

            it('should validate with username and password', function () {
                const options: ConnectionOptions = {
                    username: "username",
                    password: "password",
                    ...baseOptions
                };
                expect(validator.validate(options)).toEqual("mongodb://username:password@host:1234/database")
            });

            it('should require both username and password to prefill connection uri', function () {
                expect(validator.validate({username: "username", ...baseOptions})).toEqual("mongodb://host:1234/database");
                expect(validator.validate({password: "password", ...baseOptions})).toEqual("mongodb://host:1234/database")
            });

            it('should escape special characters in the password string', function () {
                const options: ConnectionOptions = {
                    username: "username",
                    password: "p@ssword",
                    ...baseOptions
                };
                expect(validator.validate(options)).toEqual('mongodb://username:p%40ssword@host:1234/database');
            });
        });

        it('should prefer uri string', function () {
            const options: ConnectionOptions = {
                uri: "mongodb://username1:password1@host1:12345/database1",
                ...baseOptions
            };
            expect(validator.validate(options)).toEqual("mongodb://username1:password1@host1:12345/database1")
        });
    });
});
