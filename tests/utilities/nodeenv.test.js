const { nodeEnv } = require("../../src/utilities/utilities");

describe("nodeEnv function", () => {
	beforeEach(() => {
		// Reset process.env.NODE_ENV before each test.
		delete process.env.NODE_ENV;
	});

	it("should return process.env.NODE_ENV if already set", () => {
		process.env.NODE_ENV = "test";
		expect(nodeEnv()).toBe("test");
	});

	it("should return \"production\" if argument includes \"-P\"", () => {
		process.argv = ["node", "script.ts", "-P"];
		expect(nodeEnv()).toBe("production");
	});

	it("should return \"development\" if argument includes \"-D\"", () => {
		process.argv = ["node", "script.ts", "-D"];
		expect(nodeEnv()).toBe("development");
	});

	it("should return \"development\" if no arguments are provided", () => {
		process.argv = ["node", "script.ts"];
		expect(nodeEnv()).toBe("development");
	});

	it("should return \"development\" if no arguments are provided and length is 0", () => {
		process.argv = ["node", "script.ts"];
		expect(nodeEnv()).toBe("development");
	});

	it("should throw an error if an exception occurs", () => {
		process.argv = ["node", "script.ts", "-X"]; // Simulating an invalid argument
		expect(() => nodeEnv()).toThrow();
	});
});
