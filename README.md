Why not use ts-jest?

Well, because when you try importing anything from discord.js in bot.ts,  the program thinks You're trying to import something from discord.js FILE, rather than NPM package.

I've been trying to solve it, for a while, but I can't.

I will fix it, so we won't have to build the program just to test it.

UPDATE
Even tsx doesnt seem to solve this issue... gosh.
