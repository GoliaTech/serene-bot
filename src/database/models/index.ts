import { readdirSync } from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { defaults as pgDefaults } from "pg";
import { processDatabaseConnectionVariables } from "../utilities/misc";
require("dotenv").config();

// This is to handle BIGINT.
pgDefaults.parseInt8 = true;

// Initialize the database object.
const db: any = {};

// The reason we are doing this, is because if we do processDatabaseConnectionVariables() inside the new Sequelize() function,
// you are basically re-running this the process function over and over, that's idiotic.
// So this basically runs it once, gets the values or throws error, then you can just access them through database.param
const database = processDatabaseConnectionVariables();

// Initialize the connection with Sequelize.
// Sequelize will handle translating whatever we do in schema and all that, so it can be used with all databases.
// I however use postgres. If you use something else, exchange dialect "postgres" to whatever you see fit.
const sequelize = new Sequelize(database.name, database.user, database.pass, {
	dialect: "postgres",
	// The IP to the database.
	host: database.host,
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	logging: false,
});

try { sequelize.authenticate(); } catch (err) { throw new Error("there was an error" + err); }

// Where we can find the models.
const schemaDirectory = path.join(__dirname, "schema");
const dirs = readdirSync(schemaDirectory);

// This will run through the sub folders in the models directory.
// Then it will process all the files in there.
dirs.forEach((dir) => {
	const files = readdirSync(path.join(schemaDirectory, dir));

	// This goes through each file.
	files.forEach((file) => {
		const fileName = file.endsWith(".js") ? path.basename(file, ".js") : path.basename(file, ".ts");
		// This is a custom thing, that applies the name for the schema IN THE DATABASE,
		// based on the sub folder in the directory _ name of the file.
		// So you will get the model in the database for example: user_profile.
		const name = `${dir}_${fileName}`;
		const modelDefiner = require(path.join(schemaDirectory, dir, file));

		// Handle both ES and CommonJS.
		const schema = modelDefiner.default || modelDefiner;

		// Apply the new model into the database object, based on the defined name.
		// This gets the default export.
		db[name] = schema(sequelize);
	});
});

// Associations.
// This is a default CLI-sequelize thing, so I had nothing to do with this one.
Object.keys(db).forEach(async (modelName) => {
	if (await db[modelName].associate) {
		await db[modelName].associate(db);
	}
});

// Assign a new .sequelize object in database, to process sequelize stuff.
db.sequelize = sequelize;
// This has to be :any, unfortunate because many models are different. Writing interface/definition for them would be a nightmare.
const models = db.sequelize.models;

// We can easily export the SPECIFIC parts of the database,
// like specifically the sequelize parts, or the model parts.
export { models, sequelize as seql };

// Sometimes however you need to export the entire database object.
// It is the default export.
export default db;
