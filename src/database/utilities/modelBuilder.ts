import { Model, Sequelize, DataTypes as DataTypesType } from "sequelize";
import { defaults as pgDefaults } from "pg";
import { randomUUID } from "crypto";

pgDefaults.parseInt8 = true;

function newSchema(sequelize: Sequelize) {
	const schemaName: string = "user_core";
	class Schema extends Model {
		static associate(models: any) {
			// Define association here
		}
	}
	Schema.init(
		{
			user_uuid: {
				type: DataTypesType.UUID,
				defaultValue: randomUUID(),
				allowNull: false,
				primaryKey: true,
				unique: true,
			},
		},
		{
			sequelize, 							// The Sequelize instance.
			modelName: schemaName, 	// The model name.
			tableName: schemaName, 	// The table name.
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

const schemaFunction: SchemaFunction = (sequelize: Sequelize) => {
	return newSchema(sequelize);
};

export default schemaFunction;



// This file, I want to make it so that the schemas use this builder, instead of re-typing everything for every file.
// In progres.