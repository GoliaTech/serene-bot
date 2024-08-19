import { AppDataSource } from "../datasource";
import { RPG } from "../entity";

export async function findAllClasses() {
	try {
		await AppDataSource.initialize();

		const classes = await AppDataSource.manager.find(RPG.Class);

		await AppDataSource.destroy();

		return classes;
	} catch (e: any) {
		console.error(e);
		return "It didn't work";
	}
}