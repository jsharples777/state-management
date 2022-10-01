export class InvalidValueError extends Error {
    constructor(msg: string) {
        super(msg);

        Object.setPrototypeOf(this, InvalidValueError.prototype);
    }
}
