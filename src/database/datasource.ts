import "reflect-metadata";
import { DataSource, DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";
import { Card, Discord, RPG, User } from "./entity/index";
import { logInfo, nodeEnv } from "../utilities/utilities";
require("dotenv").config();

process.env.NODE_ENV = nodeEnv();
logInfo(`We are setting database options within following NODE_ENV: [ ${process.env.NODE_ENV} ]`);

const database = {
	name: process.env.NODE_ENV == "development" ? process.env.DB_DEV_NAME : process.env.DB_PROD_NAME,
	host: process.env.NODE_ENV == "development" ? process.env.DB_DEV_HOST : process.env.DB_PROD_HOST,
	user: process.env.NODE_ENV == "development" ? process.env.DB_DEV_USER : process.env.DB_PROD_USER,
	pass: process.env.NODE_ENV == "development" ? process.env.DB_DEV_PASS : process.env.DB_PROD_PASS,
	//type: process.env.NODE_ENV == "development" ? process.env.DB_DEV_TYPE : process.env.DB_PROD_TYPE,
	port: process.env.NODE_ENV == "development" ? process.env.DB_DEV_PORT : process.env.DB_PROD_PORT
};

if (!database.name || !database.host || !database.pass || !database.user || !database.port) {
	throw new Error("Name, host, user, or pass, (or all) is empty! Please fix.");
}

const naminngStrategy = require('typeorm-naming-strategies')
	.SnakeNamingStrategy;

export const AppDataSource = new DataSource({
	// This is a TYPE data. So my idea won't work atm, too lazy to fix too. TOO BAD.
	type: "postgres",
	host: database.host,
	port: Number(database.port),
	username: database.user,
	password: database.pass,
	database: database.name,
	synchronize: false,
	logging: process.env.NODE_ENV == "development" ? true : false,
	entities: [
		User.Core,
		User.Level,
		User.Currency,
		User.LevelName,
		User.PrestigeName,
		User.Daily,
		User.Item,
		User.Inventory,
		Card.Core,
		Card.Set,
		Card.Rewards,
		RPG.CharacterCore,
		RPG.Class,
		RPG.Race,
		Discord.Server
	],
	subscribers: [],
	migrations: [],
	namingStrategy: new naminngStrategy(),
});
