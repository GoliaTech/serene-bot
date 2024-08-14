import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./index";

export const AppDataSource = new DataSource({
	type: "postgres",
	host: "localhost",
	port: 5432,
	username: "bruv",
	password: "123456",
	database: "breh",
	synchronize: false,
	logging: true,
	entities: [User.Core, User.Level, User.Currency],
	subscribers: [],
	migrations: [],
});