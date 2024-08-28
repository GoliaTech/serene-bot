import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, OneToMany } from "typeorm";
import { UserLevel } from "./level";
import { UserCurrency } from "./currency";
import { CharacterCore } from "../rpg/characterCore";
import { UserDaily } from "./daily";
import { UserInventory } from "./inventory";

/**
 * User Core
 *
 * @export
 * @class UserCore
 */
@Entity({ name: "user_core", schema: "user_core" })
export class UserCore {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;
	@Column({ type: "varchar", length: 64, nullable: true })
	display_name!: string;
	@Column({ type: "text", unique: true })
	discord_id!: string;
	@CreateDateColumn({ type: "timestamp" })
	joined_at!: Date;
	// Relations to other tables.
	@OneToOne(() => UserLevel, (userLevel) => userLevel.userCore)
	userLevel!: UserLevel;
	@OneToOne(() => UserCurrency, (userLevel) => userLevel.userCore)
	userCurrency!: UserCurrency;
	@OneToMany(() => CharacterCore, (characters) => characters.userCore)
	characters!: CharacterCore[];
	@OneToOne(() => UserDaily, (udaily) => udaily.userCore)
	dailies!: UserDaily;
	@OneToMany(() => UserInventory, (inventory) => inventory.userCore)
	inventory!: UserInventory;
};
