'use strict';

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

exports.DrizzleError = DrizzleError;
exports.TransactionRollbackError = TransactionRollbackError;
//# sourceMappingURL=errors-d0192d62.cjs.map
