## Mongoize ORM

![npm](https://img.shields.io/npm/v/mongoize-orm)
![CI](https://github.com/oflynned/Mongoize-ORM/workflows/CI/badge.svg)
![codecov](https://codecov.io/gh/oflynned/mongoize-orm/branch/master/graph/badge.svg)

### Setup

```
$ npm install -S mongoize-orm
$ yarn add mongoize-orm
```

### Disclaimer

Data generally becomes relational after a while, you should switch to a relational database at some point when your POC becomes mature enough instead of using a pseudo-relational wrapper on documents.

### Show me some actual examples

Have a look here for some simple examples

https://github.com/oflynned/Mongoize-ORM/tree/master/src/example

Have a look here for a full TypeScript Express web server that gets transpiled to js

https://github.com/oflynned/Mongoize-ORM-Example/

### Quick start

You just need to implement the two abstract classes `Schema` and `BaseDocument` to get started with using Mongoize-ORM.
You'll also need to implement your own model type extending `BaseModelType` for the TypeScript layer of things.

```
import { Schema, BaseDocument, BaseModelType } from 'mongoize-orm'

// define a ts type interface for strong typing
export interface AnimalType extends BaseModelType {
  name: string;
  legs?: number;
}

// define a db schema for validating data passed
export class AnimalSchema extends Schema<AnimalType> {
  joiBaseSchema(): object {
    return {
      name: Joi.string().required(),
      legs: Joi.number().min(0)
    };
  }

  joiUpdateSchema(): object {
    return {
      name: Joi.string(),
      legs: Joi.number().min(0)
    };
  }
}

// hey presto you now have an instance with an abstract method to implement
// with a strong interface type
class Animal extends BaseDocument<AnimalType, AnimalSchema> {
  joiSchema(): AnimalSchema {
    return new AnimalSchema();
  }
}
```

To persist records, you need a database client (either in-memory or mongodb) to connect in order to use Mongoize ORM.

```
import { InMemoryClient, MongoClient } from 'mongoize-orm';

const client = await new InMemoryClient().connect();
```

Now you have a fully-usable model that you can perform actions on or commit to a database.

```
const animal: Animal = new Animal().build({name: "Doggo", legs: 4}).save(client);
console.log(animal.toJson());

// don't forget to close the connection when you're done
await client.close();

{
  name: 'Doggo',
  legs: 4,
  _id: '0b498ead-4915-4076-adf8-eb49ac72d12c',
  createdAt: 2020-03-16T14:22:35.277Z,
  updatedAt: null,
  deletedAt: null,
  deleted: false,
}
```

### Non-Relational Data

For any records that correspond to being documents where you either want to nest everything as a property, or don't care about relationships (yet),
then your model needs to extend `BaseDocument` and you follow your own schema that you set. No redundant abstract methods, no hackiness.

#### Type

```
import { BaseModelType } from "mongoize-orm";

export interface AnimalType extends BaseModelType {
  name: string;
  legs?: number;
}
```

#### Schema

```
import { Schema, Joi } from "mongoize-orm";
import { AnimalType } from "./type

export class AnimalSchema extends Schema<AnimalType> {
  joiBaseSchema(): object {
    return {
      name: Joi.string().required(),
      legs: Joi.number().min(0)
    };
  }

  joiUpdateSchema(): object {
    return {
      name: Joi.string(),
      legs: Joi.number().min(0)
    };
  }
}
```

#### Model

```
import { MongoClient, BaseDocument, Repository } from "mongoize-orm";
import { AnimalType } from "./type";
import { AnimalSchema } from "./schema";

class Animal extends BaseDocument<AnimalType, AnimalSchema> {
  joiSchema(): AnimalSchema {
    return new AnimalSchema();
  }
}

export default Animal;
```

### Relational Data

Models generally have relationships to one another, the `RelationalDocument` type is a subtype of `BaseDocument` that allows you to specify how documents are related to each other.
The `.populate` method on a relational document fetches the document's layer of relationships, and does not populate relationships of relationships to prevent infinite loops.

#### Type

```
import { BaseModelType } from "mongoize-orm";

export interface AnimalType extends BaseModelType {
  name: string;
  legs?: number;
  ownerId?: string;
}
```

### Relationship

```
import { BaseRelationshipType } from "mongoize-orm";

export interface AnimalRelationships extends BaseRelationshipType {
  owner?: Person;
}
```

#### Schema

```
import { Schema, Joi } from "mongoize-orm";
import { AnimalType } from "./type

export class AnimalSchema extends Schema<AnimalType> {
  joiBaseSchema(): object {
    return {
      name: Joi.string().required(),
      legs: Joi.number().min(0)
    };
  }

  joiUpdateSchema(): object {
    return {
      name: Joi.string(),
      legs: Joi.number().min(0)
    };
  }
}
```

#### Model

```
import { MongoClient, RelationalDocument, Repository } from "mongoize-orm";
import { AnimalType } from "./type" }
import { AnimalSchema } from "./schema";
import { AnimalRelationships } from "./relationships";

import Person from "../person";

class Animal extends RelationalDocument<
  AnimalType,
  AnimalSchema,
  AnimalRelationships
> {
  joiSchema(): AnimalSchema {
    return new AnimalSchema();
  }

  async relationalFields(client: MongoClient): Promise<AnimalRelationships> {
    return {
      owner: await this.owner(client)
    };
  }

  private async owner(client: MongoClient): Promise<Person> {
    return Repository.with(Person).findById(client, this.toJson().ownerId);
  }
}

export default Animal;
```

**You need to call** `.populate` **on the instance to populate that level of relationships. Otherwise it will be undefined!**

### Database Clients

All clients extend from the abstract class `DatabaseClient` which has no functionality directly.
To interact with a database, you should use `MongoClient` or `InMemoryClient` depending on your use case.

#### MongoClient

`MongoClient` extends `DatabaseClient` and implements the MongoDB driver so it acts as a wrapper for it.

Using the client is simple, it will default to `localhost:27017`. You need to pass the database as an option or through the URI.

```
const client = await new MongoClient().connect({ database: 'mongoize' });
```

Passing options is done through the `.connect` method.
Keep in mind that a URI will be prioritised over a raw config with individual options:

```
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
```

There is also an option to append the `NODE_ENV` environment value to the db when you enable the option `appendDatabaseEnvironment`.
For a database named `mongoize` on the `development` environment, the database is automatically set to `mongoize-development`.
This value defaults to false, it must be set to true through options on connect. It is not available on the in-memory client.

Mongo client options can be customised by overriding the typed `.mongoOptions` method. It defaults to:

```
mongoOptions(): MongoClientOptions {
    return {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
  }
```

#### InMemoryClient

This is great for use in ephemeral testing scenarios, or short-lived servers (would not recommend that).
No config is needed as it does all the setup & teardown itself as part of the lifecycle of the in-memory server.

```
const client = await new InMemoryClient().connect();

// your db client is now ready for use
```

### Model Definition

Models comprise of three distinct parts:

- TypeScript property type
  - Allows auto-prediction of types and records
  - Pertains to any data (including volatile) that needs to be shown in a context menu
- Joi validation schema
  - Used by `Joi` to validate any data provided for creation/update functions
  - For validation checks against a schema before persisting to a db
- Model document
  - Centralised point for extending a MongoDB document and override any of the lifecycle hooks

##### .build()

Construct a new instance with the type and base type schema in mind.

##### .collection()

Defaults to the name of the child class's constructor with an appended `s`

`User -> users`

This can be overridden in the derived model class if the name has an irregular plural

```
collection(): string {
  return "people";
}
```

##### .from()\*

Don't use this method unless you want to copy a record directly into another from the schema definition-level. This is used internally to cast database records into model instances. Use `.build()` instead to obey schemas.

On a model instance however, the type is still inferred but no base record content will be populated (\_id, createdAt, updatedAt, deletedAt, deleted)

##### .save()

Saves the instance to the persistence layer, only allowed to be called once as \_id has a unique constraint.

Use `.update()` or `Repository#updateOne()` if you want to update data stored in a record.

##### .update()

Updates a record's fields as per its definition type interface.

##### .delete()

Defaults to soft-delete which sets `.deleted` and `.deletedAt` fields. Keeps record in database without purging it.

There is also hard-delete which purges the record from the store and sets the instance to `undefined`.

##### .toJSON()

Returns an untyped object of all the fields on the record inherited from `IBaseRecord` (timestamps, id, etc) and the fields set on the interface type.

#### Model Instance Lifecycle Methods

##### Create

When `await new User().build({...}).save()` is called:

- onPreValidate
- validate\*
- onPostValidate
- onPreSave
- save\*
- onPostSave

##### Update

When `await user.update({...})` or `await Repository.with(User).updateOne(client, "id", {...})` is called:

- validateOnUpdate\*
- onPreUpdate
- update\*
- onPostUpdate

##### Delete

When `await user.delete({...})` or `await Repository.with(User).deleteOne(client, "id", {...})` is called:

- onPreDelete
- delete\*
- onPostDelete

### Repositories

The repository is for directly interacting with the db via a facade without having a model to work with.

Fetch an instance of the repository with `Repository.with(User)`. You can use the methods below once you acquire it.

##### .count

Returns the count of records matching the query.

##### .deleteCollection

Purges the collection by name.

##### .deleteMany

Deletes records (hard or soft) with a query.

##### .deleteOne

Deletes a single record by id.

##### .findOne

Returns a single record if it exists (first in the array). Returns `undefined` if not.

##### .findById

Returns a record if the id exists. Returns `undefined` if not.

##### .findMany

Returns an array of records by a query. Returns `[]` if nothing matches.

##### .exists

Returns `true` if the query contains at least 1 record. Returns `false` if not.

##### .updateOne

Dispatches the update when validated to the db. Returns an updated record if successfully validated. Throws an error if the record does not exist.

For auto-completion on the param types, the full list of generics needs to be passed to the static repository instance:

```
Repository
    .with<AnimalType, Animal, AnimalSchema>(Animal)
    .updateOne(client, animal.toJson()._id, { name: "Doggo" });
```

If you know the params, then you can just pass them untyped.

```
Repository
    .with(Animal)
    .updateOne(client, animal.toJson()._id, { name: "Doggo" });
```

Beware - the validator will cut out any unknown keys unless you manually turn it off in the options parameter.

```
Repository
    .with(Animal)
    .updateOne(client, animal.toJson()._id, { newParameter: "Cool" }, { validateUpdate: false });
```
