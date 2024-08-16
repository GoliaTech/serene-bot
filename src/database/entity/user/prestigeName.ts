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

	@Column({ type: "varchar", length: 64 })
	name!: string;

	@Column({ type: "text", nullable: true })
	prestige_range!: string;

	@Column({ type: "text", nullable: true })
	emblem!: string;
};
