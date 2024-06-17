const { db } = require("../../.dev/database/models/index");
require("dotenv").config();

describe("Database", () => {
	beforeEach(() => {
		process.argv = ["test", "test", "-D"];
	});
	it("should be defined", () => {
		const shit = db;
		console.log(shit);
		expect(db).toBeDefined();
	});
});