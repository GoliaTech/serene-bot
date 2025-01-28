import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
@Entity({ name: "waifu" })
export class Waifu {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	@Column({ nullable: false })
	location!: string;

	@Column()
	gender!: string;

	@Column()
	job!: string;

	@Column()
	age!: number;

	@Column()
	race!: string;

	@Column({ length: 320 })
	description!: string;

	// Postgres-specific array column to store up to 5 interests
	// You can enforce the "5 maximum" logic at the application level
	@Column({ array: true, default: [], type: "varchar" })
	interests!: string[];

	@Column({ default: 0 })
	likes!: number;

	@Column({ default: 0, name: "super_likes" })
	superLikes!: number;

	@Column({ default: 0 })
	dislikes!: number;

	// Store multiple image URLs as text array
	@Column({ type: "text", name: "sfw_images", nullable: false })
	sfwImages!: string;

	@Column({ type: "text", name: "nsfw_imagepath", nullable: false })
	nsfwImages!: string;
}