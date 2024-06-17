import { Model, Sequelize, DataTypes } from "sequelize";
import { defaults as pgDefaults } from "pg";
import { randomUUID } from "crypto";

pgDefaults.parseInt8 = true;

function schema(sequelize: Sequelize) {
	const newSchema: string = "user_core";
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
}

type SchemaFunction = (sequelize: Sequelize) => typeof Model;

// Annotate the export function with the type alias.
const schemaFunction: SchemaFunction = (sequelize: Sequelize) => {
	return schema(sequelize);
};

// Finally export the schema.
// Handle both ES and CommonJS exports.
module.exports = schemaFunction;
module.exports.default = schemaFunction;
