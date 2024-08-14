import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./index";
import { nodeEnv } from "../utilities/utilities";
require("dotenv").config();

console.log("we are setting database options...");
process.env.NODE_ENV = nodeEnv();
console.log(process.env.NODE_ENV);

const database = {
	name: process.env.NODE_ENV == "development" ? process.env.DB_DEV_NAME : process.env.DB_PROD_NAME,
	host: process.env.NODE_ENV == "development" ? process.env.DB_DEV_HOST : process.env.DB_PROD_HOST,
	user: process.env.NODE_ENV == "development" ? process.env.DB_DEV_USER : process.env.DB_PROD_USER,
	pass: process.env.NODE_ENV == "development" ? process.env.DB_DEV_PASS : process.env.DB_PROD_PASS,
	type: process.env.NODE_ENV == "development" ? process.env.DB_DEV_TYPE : process.env.DB_PROD_TYPE,
	port: process.env.NODE_ENV == "development" ? process.env.DB_DEV_PORT : process.env.DB_PROD_PORT
};

if (!database.name || !database.host || !database.pass || !database.user || !database.type || !database.port) {
	throw new Error("Name, host, user, or pass, (or all) is empty! Please fix.");
}

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
	entities: [User.Core, User.Level, User.Currency],
	subscribers: [],
	migrations: [],
});