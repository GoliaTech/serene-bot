import { commandBuilder } from "../bot/misc/commandBuilder";

describe('commandBuilder', () => {
	it('should throw an error if the name is too short', () => {
		expect(() => {
			commandBuilder('', 'description', { dm: true, nsfw: false });
		}).toThrow('Name must be between 3 and 32 characters long!');
	});

	it('should throw an error if the name is too long', () => {
		expect(() => {
			commandBuilder('a'.repeat(33), 'description', { dm: true, nsfw: false });
		}).toThrow('Name must be between 3 and 32 characters long!');
	});

	it('should throw an error if the description is too short', () => {
		expect(() => {
			commandBuilder('name', '', { dm: true, nsfw: false });
		}).toThrow('Description must be between 3 and 100 characters long!');
	});

	it('should throw an error if the description is too long', () => {
		expect(() => {
			commandBuilder('name', 'a'.repeat(101), { dm: true, nsfw: false });
		}).toThrow('Description must be between 3 and 100 characters long!');
	});

	it('should sanitize the name and set the description', () => {
		const command = commandBuilder('Name With Spaces', 'description', { dm: true, nsfw: false });
		expect(command.name).toBe('name_with_spaces');
		expect(command.description).toBe('description');
	});

	it('should set the DM and NSFW permissions', () => {
		const command = commandBuilder('name', 'description', { dm: true, nsfw: true });
		expect(command.dm_permission).toBe(true);
		expect(command.nsfw).toBe(true);
	});

	it('should default the DM and NSFW permissions to false', () => {
		const command = commandBuilder('name', 'description');
		expect(command.dm_permission).toBe(false);
		expect(command.nsfw).toBe(false);
	});
});

console.log(commandBuilder('name', 'description', { dm: true, nsfw: true },
	{
		name: {
			"en-GB": "Name",
			fr: "nom"
		},
		description: {
			"en-GB": "description",
			fr: "descripciomn"
		}
	}
).toJSON());