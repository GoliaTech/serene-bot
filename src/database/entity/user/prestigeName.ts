import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * Prestige Name
 * 
 * @export
 * @class PrestigeName
 */
@Entity({ name: "prestige_name" })
export class PrestigeName {
	@PrimaryGeneratedColumn()
	id!: number;
	@Column({ type: "int" })
	min_level!: number;
	@Column({ type: "int" })
	max_level!: number;
	@Column({ type: "varchar", length: 64 })
	title!: string;
};
