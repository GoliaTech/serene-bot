import { Model, Sequelize, DataTypes } from "sequelize";
import { defaults as pgDefaults } from "pg";
import { randomUUID } from "crypto";
import { SchemaFunction, schemaName } from "../../../utilities/misc";

pgDefaults.parseInt8 = true;

function schema(sequelize: Sequelize) {
	const newSchema: string = schemaName(__dirname, __filename);
	class Schema extends Model {
		// Should be :SpecificModelType, but...
		static associate(models: any) {
			// Define association here
		}
	}
	Schema.init(
		{
			user_uuid: {
				type: DataTypes.UUID,
				defaultValue: randomUUID(),
				allowNull: false,
				primaryKey: true,
				unique: true,
			},
			discord_id: {
				type: DataTypes.STRING,
				defaultValue: "",
				allowNull: false,
				unique: true,
				validate: {
					is: /^[0-9]{17,18,19}$/ // Discord ID format validation. 17,18,19 defines length and future proofs.
				},
			},
			daily_streak: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
		},
		{
			sequelize, 							// The Sequelize instance.
			modelName: newSchema, 	// The model name.
			tableName: newSchema, 	// The table name.
			freezeTableName: true, 	// Freeze the table name.
			timestamps: false, 			// Disable timestamps.
			indexes: [ 							// Define indexes.
				{
					unique: true, 												// Ensure uniqueness.
					fields: ["user_uuid", "discord_id"], 	// Index fields.
				},
			],
		}
	);
	return Schema;
}

// Annotate the export function with the type alias.
const schemaFunction: SchemaFunction = (sequelize: Sequelize) => {
	return schema(sequelize);
};

// Finally export the schema.
// Handle both ES and CommonJS exports.
module.exports = schemaFunction;
module.exports.default = schemaFunction;
