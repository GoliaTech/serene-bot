import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * The RP Core has ids and names 
 */
@Entity("rp_core")
export class RPCore {
	@PrimaryGeneratedColumn()
	id!: number;
	@Column("name")
	name!: string;
}

// /rpcreate = ceats rp
// /rpcreatechar = creates character. YOu choose which rp they belong to.