export class DefinitionNotFoundError extends Error {
    constructor(msg: string) {
        super(msg);

        Object.setPrototypeOf(this, DefinitionNotFoundError.prototype);
    }
}
