## Mongoize ORM

### Setup

### Models

Models comprise of three distinct parts:

- TypeScript property type
  - Allows auto-prediction of types and records
  - Pertains to any data (including volatile) that needs to be shown in a context menu
- Joi validation schema
  - Used by `Joi` to validate any data provided for creation/update functions
  - For validation checks against a schema before persisting to a db
- Model document
  - Centralised point for extending a MongoDB document and override any of the lifecycle hooks

```
type IUser = {
    name: string;
    email: string;
    password?: string;
    hash?: string;
}

class UserSchema extends Schema<IUser> {
    joiSchema(): object {
        return {
            name: Joi.string().required(),
            email: Joi.string().required(),
            hash: Joi.string().required()
        }
    }
}

class User extends BaseDocument<IUser, UserSchema> {
    joiSchema(): UserSchema {
        return new UserSchema();
    }

    async onPreValidate(): Promise<void> {
        this.record.hash = await saltUserCredentials(this.record.password);
    }
}
```

### Lifecycle Methods
\* is for an internal method that cannot be overwritten.

#### Create
- onPreValidate
- validate*
- onPostValidate
- onPreSave
- save*
- onPostSave

#### Read
n/a

#### Update
- onPreValidate
- validate*
- onPostValidate
- update*

#### Delete
- onPreDelete
- delete*
- onPostDelete
