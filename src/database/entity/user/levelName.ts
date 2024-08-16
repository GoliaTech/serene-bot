import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * Level Name
 * 
 * @export
 * @class LevelName
 */
@Entity({ name: "level_name" })
export class LevelName {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "varchar", length: 64 })
	name!: string;

	@Column({ type: "text", nullable: true })
	level_range!: string;

	@Column({ type: "text", nullable: true })
	emblem!: string;
};
