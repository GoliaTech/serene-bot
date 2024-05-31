import { Model, Sequelize, DataTypes as DataTypesType, UUIDV4 } from "sequelize";
import { defaults as pgDefaults } from "pg";

pgDefaults.parseInt8 = true;

function schema(sequelize: Sequelize, DataTypes: typeof DataTypesType) {
	const newSchema: string = "user_core";
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
				defaultValue: UUIDV4,
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

// Define a type alias for the export function.
// We apparently have to do this now, otherwise TS screams at me.
type SchemaFunction = (sequelize: Sequelize, DataTypes: typeof DataTypesType) => typeof Model;

// Annotate the export function with the type alias.
const schemaFunction: SchemaFunction = (sequelize: Sequelize, DataTypes: typeof DataTypesType) => {
	return schema(sequelize, DataTypes);
};

// Finally export the schema.
export default schemaFunction;