const { Sequelize, Model, DataTypes } = require("sequelize");

// Import the schemaFunction
const schemaFunction = require("../../.dev/database/utilities/modelBuilder");

describe('schemaFunction', () => {
    it('should return a valid schema instance', () => {
        const sequelizeMock = Sequelize;
        const dataTypesMock = DataTypes;

        const result = schemaFunction(sequelizeMock);

        expect(result).toBeInstanceOf(Model);
    });
});