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
			this.belongsTo(models["user_core"], { foreignKey: "uuid" });
		}
	}
	Schema.init(
		{
			uuid: {
				type: DataTypes.UUID,
				allowNull: false,
				primaryKey: true,
				unique: true,
			},
			common: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
			premium: {
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
					fields: ["uuid"], 	// Index fields.
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
