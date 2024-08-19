import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "..";
import { Race } from "./race";
import { Class } from "./class";

@Entity({ name: "rpg_character_core" })
export class CharacterCore {
	@PrimaryGeneratedColumn("uuid")
	character_uuid!: string;
	@Column({ type: "int" })
	character_id!: number;
	@Column({ type: "varchar", length: 64 })
	name!: string;
	// Relations.
	@ManyToOne(() => User.Core, (user) => user.characters)
	@JoinColumn({ name: "user_uuid" })
	userCore!: User.Core;
	@ManyToOne(() => Race, (race) => race.characters)
	@JoinColumn({ name: "race_id" })
	race!: Race;
	@ManyToOne(() => Race, (race) => race.characters)
	@JoinColumn({ name: "class_id" })
	class!: Class;
};