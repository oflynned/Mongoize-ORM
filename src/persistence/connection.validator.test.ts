import {ConnectionOptions, ConnectionValidator} from "./connection.validator";

describe('Connection Validator', () => {
    const validator: ConnectionValidator = new ConnectionValidator();

    describe("validate", () => {

        xit('should validate uri', () => {
            // const options: ConnectionOptions = {
            //   uri: "mongodb://username:password@host:port/database"
            // };
            // expect(validator.validate(options)).toEqual("mongodb://username:password@host:port/database")
        });

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

        xit('should prefer uri', function () {

        });
    });
});
