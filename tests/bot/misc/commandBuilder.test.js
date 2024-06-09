const { Locale } = require("discord.js");
const { commandBuilder } = require("../../../.dev/bot/misc/commandBuilder");

describe("commandBuilder", () => {
	it("should throw an error if the name is too short", () => {
		expect(() => {
			commandBuilder('', "description", { dm: true, nsfw: false });
		}).toThrow("Name must be between 3 and 32 characters long!");
	});

	it("should throw an error if the name is too long", () => {
		expect(() => {
			commandBuilder('a'.repeat(33), "description", { dm: true, nsfw: false });
		}).toThrow("Name must be between 3 and 32 characters long!");
	});

	it("should throw an error if the description is too short", () => {
		expect(() => {
			commandBuilder("name", '', { dm: true, nsfw: false });
		}).toThrow("Description must be between 3 and 100 characters long!");
	});

	it("should throw an error if the description is too long", () => {
		expect(() => {
			commandBuilder("name", 'a'.repeat(101), { dm: true, nsfw: false });
		}).toThrow("Description must be between 3 and 100 characters long!");
	});

	it("should sanitize the name and set the description", () => {
		const command = commandBuilder("Name With Spaces", "description", { dm: true, nsfw: false });
		expect(command.name).toBe("name_with_spaces");
		expect(command.description).toBe("description");
	});

	it("should set the DM and NSFW permissions", () => {
		const command = commandBuilder("name", "description", { dm: true, nsfw: true });
		expect(command.dm_permission).toBe(true);
		expect(command.nsfw).toBe(true);
	});

	it("should default the DM and NSFW permissions to false", () => {
		const command = commandBuilder("name", "description");
		expect(command.dm_permission).toBe(false);
		expect(command.nsfw).toBe(false);
	});

	it("should set localizations", () => {
		let localizedNames = {
			enGB: "Localized Name",
			svSE: "Lokaliserat Namn"
		};
		const localizedDescriptions = {
			enGB: "Localized Description",
			svSE: "Lokaliserad Beskrivning"
		};
		const command = commandBuilder("name", "description", { dm: true, nsfw: false }, {
			name: {
				[Locale.EnglishGB]: localizedNames.enGB,
				[Locale.Swedish]: localizedNames.svSE,
			},
			description: {
				[Locale.EnglishGB]: localizedDescriptions.enGB,
				[Locale.Swedish]: localizedDescriptions.svSE,
			},
		});
		localizedNames = {
			enGB: localizedNames.enGB.replace(/\s/g, "_").toLowerCase(),
			svSE: localizedNames.svSE.replace(/\s/g, "_").toLowerCase(),
		};
		expect(command.name_localizations?.["en-GB"]).toBe(localizedNames.enGB);
		expect(command.name_localizations?.["sv-SE"]).toBe(localizedNames.svSE);
		expect(command.description_localizations?.["en-GB"]).toBe(localizedDescriptions.enGB);
		expect(command.description_localizations?.["en-GB"]).toBe(localizedDescriptions.enGB);
	});

	it("should should throw an error if localization name is too short", () => {
		expect(() => {
			commandBuilder("name", "description", { dm: true },
				{
					name: {
						[Locale.Bulgarian]: "a"
					}
				}
			);
		}).toThrow(`${[Locale.Bulgarian]} localized name must be between 3 and 32 characters long!`);
	});

	it("should should throw an error if localization name is too long", () => {
		expect(() => {
			commandBuilder("name", "description", { dm: true },
				{
					name: {
						[Locale.Bulgarian]: 'a'.repeat(34)
					}
				}
			);
		}).toThrow(`${[Locale.Bulgarian]} localized name must be between 3 and 32 characters long!`);
	});

	it("should should throw an error if localization description is too short", () => {
		expect(() => {
			commandBuilder("name", "description", { dm: true },
				{
					description: {
						[Locale.Bulgarian]: "a"
					}
				}
			);
		}).toThrow(`${[Locale.Bulgarian]} localized description must be between 3 and 100 characters long!`);
	});

	it("should should throw an error if localization description is too long", () => {
		expect(() => {
			commandBuilder("name", "description", { dm: true },
				{
					description: {
						[Locale.Bulgarian]: 'a'.repeat(102)
					}
				}
			);
		}).toThrow(`${[Locale.Bulgarian]} localized description must be between 3 and 100 characters long!`);
	});
});
