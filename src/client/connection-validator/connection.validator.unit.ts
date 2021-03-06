import { ConnectionOptions, ConnectionValidator } from "./connection.validator";

describe("Connection Validator", () => {
  const validator: ConnectionValidator = new ConnectionValidator();
  const baseOptions: ConnectionOptions = {
    host: "host",
    port: 1234,
    database: "database"
  };

  describe("validate", () => {
    describe("with uri", () => {
      it("should validate uri", () => {
        const options: ConnectionOptions = {
          uri: "mongodb://username:password@host:1234/database"
        };
        validator.validate(options);
        expect(validator.options.uri).toEqual(
          "mongodb://username:password@host:1234/database"
        );
      });

      it("should validate in-memory uri", () => {
        const options: ConnectionOptions = {
          uri: "mongodb://127.0.0.1:44577/7fb25855-8d0c-448d-88d8-1cb341e7554c?"
        };

        validator.validate(options);
        expect(validator.options.host).toEqual("127.0.0.1");
        expect(validator.options.port).toEqual(44577);
        expect(validator.options.database).toEqual(
          "7fb25855-8d0c-448d-88d8-1cb341e7554c?"
        );
      });

      it("should throw error on invalid port", () => {
        const options: ConnectionOptions = {
          uri: "mongodb://username:password@host:port/database"
        };
        expect(() => validator.validate(options)).toThrow(
          "bad connection string passed"
        );
      });

      it("should require database", () => {
        const options: ConnectionOptions = {
          uri: "mongodb://username:password@host:port"
        };
        expect(() => validator.validate(options)).toThrow(
          "bad connection string passed"
        );
      });

      it("should parse connection string with credentials", () => {
        const options: ConnectionOptions = {
          uri: "mongodb://username:password@host:1234/database"
        };

        validator.validate(options);
        expect(validator.options.uri).toEqual(
          "mongodb://username:password@host:1234/database"
        );
        expect(validator.options.username).toEqual("username");
        expect(validator.options.password).toEqual("password");
        expect(validator.options.host).toEqual("host");
        expect(validator.options.port).toEqual(1234);
        expect(validator.options.database).toEqual("database");
      });

      it("should parse connection string with no credentials", () => {
        const options: ConnectionOptions = {
          uri: "mongodb://host:1234/database"
        };

        validator.validate(options);
        expect(validator.options.uri).toEqual("mongodb://host:1234/database");
        expect(validator.options.username).toBeUndefined();
        expect(validator.options.password).toBeUndefined();
        expect(validator.options.host).toEqual("host");
        expect(validator.options.port).toEqual(1234);
        expect(validator.options.database).toEqual("database");
      });
    });

    describe("with cluster srv connection string", () => {
      it("should parse correctly", () => {
        const options: ConnectionOptions = {
          uri: "mongodb+srv://user:password@host/database"
        };

        validator.validate(options);
        expect(validator.options.uri).toEqual(
          "mongodb+srv://user:password@host/database"
        );
        expect(validator.options.username).toEqual("user");
        expect(validator.options.password).toEqual("password");
        expect(validator.options.host).toEqual("host");
        expect(validator.options.port).toBeUndefined();
        expect(validator.options.database).toEqual("database");
      });
    });

    describe("with auth", () => {
      describe(".appendDatabaseEnvironment", () => {
        it("should mutate database name", function() {
          validator.validate({
            ...baseOptions,
            appendDatabaseEnvironment: true
          });
          expect(validator.options.database).toEqual("database-test");
        });

        it("should not mutate database name", function() {
          validator.validate({
            ...baseOptions,
            appendDatabaseEnvironment: false
          });
          expect(validator.options.database).toEqual("database");
        });

        it("should not mutate database by default", function() {
          validator.validate({ ...baseOptions });
          expect(validator.options.database).toEqual("database");
        });
      });

      it("should validate without username and password", () => {
        validator.validate(baseOptions);
        expect(validator.options.uri).toEqual("mongodb://host:1234/database");
      });

      it("should validate with username and password", () => {
        const options: ConnectionOptions = {
          username: "username",
          password: "password",
          ...baseOptions
        };
        validator.validate(options);
        expect(validator.options.uri).toEqual(
          "mongodb://username:password@host:1234/database"
        );
      });

      it("should require both username and password to prefill connection uri", () => {
        validator.validate({ username: "username", ...baseOptions });
        expect(validator.options.uri).toEqual("mongodb://host:1234/database");
        validator.validate({ password: "password", ...baseOptions });
        expect(validator.options.uri).toEqual("mongodb://host:1234/database");
      });

      it("should escape special characters in the password string", () => {
        const options: ConnectionOptions = {
          username: "username",
          password: "p@ssword",
          ...baseOptions
        };
        validator.validate(options);
        expect(validator.options.uri).toEqual(
          "mongodb://username:p%40ssword@host:1234/database"
        );
      });
    });

    it("should prefer uri string", () => {
      const options: ConnectionOptions = {
        uri: "mongodb://username1:password1@host1:12345/database1",
        ...baseOptions
      };
      validator.validate(options);
      expect(validator.options.uri).toEqual(
        "mongodb://username1:password1@host1:12345/database1"
      );
    });
  });
});
