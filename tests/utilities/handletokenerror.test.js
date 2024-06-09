const { handleTokenError } = require("../../src/utilities/utilities");

describe("handleTokenError", () => {
    it("should throw an error with the correct message", () => {
        const errorMessage = "TEST_ERROR";
        expect(() => handleTokenError(errorMessage)).toThrowError(`Environment variable ${errorMessage} is not set.`);
    });
});