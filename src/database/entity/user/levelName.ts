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
	@Column({ type: "int" })
	min_level!: number;
	@Column({ type: "int" })
	max_level!: number;
	@Column({ type: "varchar", length: 64 })
	title!: string;
};
