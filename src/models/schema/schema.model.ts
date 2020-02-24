import BaseSchema from './base.schema'

class Schema extends BaseSchema {
    static schema() {
        return {
            ...super.schema()
        };
    }
}

export default Schema;
