import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CharacterCore } from "./characterCore";

@Entity({ name: "rpg_class" })
export class Class {
	@PrimaryGeneratedColumn("increment")
	id!: number;
	@Column({ type: "varchar", length: 64 })
	name!: string;
	@Column({ type: "text" })
	description!: string;
	@Column({ type: "text" })
	lore!: string;
	@Column({ type: "int", default: 0 })
	health!: number;
	@Column({ type: "int", default: 0 })
	mana!: number;
	@Column({ type: "int", default: 0 })
	special!: number;
	@Column({ type: "int", default: 0 })
	strength!: number;
	@Column({ type: "int", default: 0 })
	dexterity!: number;
	@Column({ type: "int", default: 0 })
	vitality!: number;
	@Column({ type: "int", default: 0 })
	intelligence!: number;
	@Column({ type: "int", default: 0 })
	wisdom!: number;
	@Column({ type: "int", default: 0 })
	endurance!: number;
	// Relations
	@OneToMany(() => CharacterCore, (characterCore) => characterCore.class)
	characters!: CharacterCore[];
};