export class InvalidValueError extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, InvalidValueError.prototype);
    }
}
//# sourceMappingURL=InvalidValueError.js.map