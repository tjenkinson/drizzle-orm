class DrizzleError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DrizzleError';
    }
    static wrap(error, message) {
        return error instanceof Error
            ? new DrizzleError(message ? `${message}: ${error.message}` : error.message)
            : new DrizzleError(message ?? String(error));
    }
}
class TransactionRollbackError extends DrizzleError {
    constructor() {
        super('Rollback');
    }
}

export { DrizzleError as D, TransactionRollbackError as T };
//# sourceMappingURL=errors-bb636d84.mjs.map
