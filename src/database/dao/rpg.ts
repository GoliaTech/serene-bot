import { logError } from "../../utilities/utilities";
import { AppDataSource } from "../datasource";
import { RPG } from "../entity";

export async function findAllClasses() {
	try {
		await AppDataSource.initialize();

		const classes = await AppDataSource.manager.find(RPG.Class);

		await AppDataSource.destroy();

		return {
			data: classes
		};
	} catch (e: any) {
		logError(e);
		return {
			data: "Something terrible happened whilst trying to access database. Contact the developer.",
			error: true,
		};
	}
}