const { getExecArgv } = require("../../src/utilities/utilities");

describe("getExecArgv function", () => {
	it("should return the correct execArgv for production environment", () => {
		process.env.NODE_ENV = "production";
		const expectedProductionExecArgv = [
			"--trace-warnings",
			"--unhandled-rejections=strict"
		];
		const result = getExecArgv();
		expect(result).toEqual(expectedProductionExecArgv);
	});

	it("should return the correct execArgv for non-production environment", () => {
		process.env.NODE_ENV = "development";
		const expectedNonProductionExecArgv = [
			"--trace-warnings",
			"-r",
			"ts-node/register"
		];
		const result = getExecArgv();
		expect(result).toEqual(expectedNonProductionExecArgv);
	});
});