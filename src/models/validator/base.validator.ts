import UnimplementedError from '../errors/unimplemented.error';

class BaseValidator {
    validate(schema){
        throw new UnimplementedError();
    }
}

export default BaseValidator;
