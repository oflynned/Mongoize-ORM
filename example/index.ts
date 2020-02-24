import Schema from "../src/models/schema/schema.model";
import Document from "../src/models/documents/base.document";

interface AnimalSchema extends Schema {
    name: String;
    legs: Number;
}

class Animal extends Document<AnimalSchema> {
    static build(params: AnimalSchema) {

    }
}

const main = async () => {
    const animal = new Animal()
        .build({name: "Doggo", legs: 4});
};

(async () => await main())();
