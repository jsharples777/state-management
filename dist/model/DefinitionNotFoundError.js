export class DefinitionNotFoundError extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, DefinitionNotFoundError.prototype);
    }
}
//# sourceMappingURL=DefinitionNotFoundError.js.map