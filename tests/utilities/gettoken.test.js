const { getToken } = require("../../src/utilities/utilities");

describe("getToken", () => {
	beforeEach(() => {
		// Reset environment variables before each test
		process.env.TOKEN = "";
		process.env.NODE_ENV = "";
	});

	it("returns the token when process.env.TOKEN is set", () => {
		process.env.TOKEN = "testToken";
		expect(getToken()).toBe("testToken");
	});

	it("determines the token based on process.env.NODE_ENV", () => {
		process.env.NODE_ENV = "production";
		process.env.TOKEN_PRODUCTION = "productionToken";
		expect(getToken()).toBe("productionToken");

		process.env.NODE_ENV = "development";
		process.env.TOKEN_DEVELOPMENT = "developmentToken";
		expect(getToken()).toBe("developmentToken");
	});

	it("throws an error for invalid process.env.NODE_ENV", () => {
		process.env.NODE_ENV = "invalid";
		expect(() => getToken()).toThrowError("Invalid NODE_ENV value: expected \"production\" or \"development\".");
	});
});