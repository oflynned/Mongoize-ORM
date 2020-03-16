## Mongoize ORM

### Setup

```
$ npm install mongoize-orm -S
$ yarn add mongoize-orm
```

### Quick start

You just need to implement the two abstract classes `Schema` and `BaseDocument` to get started with using Mongoize-ORM.

```
import { Schema, BaseDocument } from 'mongoize-orm'

// define a ts type interface for strong typing
type IAnimal = {
  name: string;
  legs?: number;
};

// define a db schema for validating data passed
class AnimalSchema extends Schema<IAnimal> {
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
class Animal extends BaseDocument<IAnimal, AnimalSchema> {
  joiSchema(): AnimalSchema {
    return new AnimalSchema();
  }
}
```

You'll also need a client (either in-memory or mongodb) to connect to for use.

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

### Reference

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

Don't use this method unless you want to copy a record directly into another from the schema definition-level. This is used internally to cast database records into model instances. Use at `.build()` instead to obey schemas.

On a model instance however, the type is still inferred but no base record content is populated (\_id, createdAt, updatedAt, deletedAt, deleted)

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

- onPreUpdate
- validateOnUpdate\*
- onPostUpdate
- update\*

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

##### deleteCollection

Purges the collection by name.

##### deleteMany

Deletes records (hard or soft) with a query.

##### deleteOne

Deletes a single record by id.

##### findOne

Returns a single record if it exists (first in the array). Returns `undefined` if not.

##### findById

Returns a record if the id exists. Returns `undefined` if not.

##### findMany

Returns an array of records by a query. Returns `[]` if nothing matches.

##### exists

Returns true if the query contains at least 1 record. Returns false if not.

##### updateOne

Dispatches the update when validated to the db. Returns an updated record if successfully validated. Returns `undefined` if record doesn't exist.
