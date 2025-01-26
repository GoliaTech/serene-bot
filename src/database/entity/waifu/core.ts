import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
@Entity({ name: "waifus" })
export class Waifu {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	@Column({ nullable: true })
	age?: number;

	@Column({ nullable: true })
	gender?: string;

	@Column({ nullable: true })
	race?: string;

	@Column({ type: "text", nullable: true })
	description?: string;

	@Column()
	imgpath!: string;

	@Column({ name: "nsfw_imgpath" })
	nsfwImgpath!: string;
}