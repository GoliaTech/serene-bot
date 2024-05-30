import { Model, Sequelize, DataTypes as DataTypesType } from "sequelize";
import { defaults as pgDefaults } from "pg";

pgDefaults.parseInt8 = true;

/**
 * This is the schema for core.
 * @param sequelize
 * @param DataTypes
 * @returns the finished schema
 */
function schema(sequelize: Sequelize, DataTypes: typeof DataTypesType) {
	const newSchema: string = "user_core";
	class Schema extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models: any) {
			// Define association here
		}
	}
	Schema.init(
		{
			// This is the user's uuid.
			user_uuid: {
				type: DataTypes.STRING,
				defaultValue: "",
				allowNull: false,
				primaryKey: true,
				unique: true,
			},
			discord_id: {
				type: DataTypes.STRING,
				defaultValue: "",
				allowNull: false,
				unique: true,
			},
			daily_streak: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: newSchema,
			tableName: newSchema,
			freezeTableName: true,
			timestamps: false,
			indexes: [
				{
					unique: true,
					fields: ["user_uuid", "discord_id"],
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