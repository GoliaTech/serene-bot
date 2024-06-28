import { Model, Sequelize, DataTypes } from "sequelize";
import { defaults as pgDefaults } from "pg";
import { randomUUID } from "crypto";
import { SchemaFunction, schemaName } from "../../../utilities/misc";

pgDefaults.parseInt8 = true;

// Annotate the export function with the type alias.
const schemaFunction: SchemaFunction = (sequelize: Sequelize) => {
	const newSchema: string = schemaName(__dirname, __filename);
	class Schema extends Model {
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
			level: {
				type: DataTypes.INTEGER,
				defaultValue: 1,
				allowNull: false,
				primaryKey: false,
				unique: false,
			},
			prestige: {
				type: DataTypes.INTEGER,
				defaultValue: 1,
				allowNull: false,
				primaryKey: false,
				unique: false,
			},
			xp: {
				type: DataTypes.INTEGER,
				defaultValue: 1,
				allowNull: false,
				primaryKey: false,
				unique: false,
			},
			max_xp: {
				type: DataTypes.INTEGER,
				defaultValue: 1,
				allowNull: false,
				primaryKey: false,
				unique: false,
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
					fields: ["user_uuid"], 	// Index fields.
				},
			],
		}
	);
	return Schema;
};

// Finally export the schema.
// Handle both ES and CommonJS exports.
module.exports = schemaFunction;
module.exports.default = schemaFunction;
