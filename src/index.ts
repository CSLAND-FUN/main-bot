import "module-alias/register";
console.clear();

import DiscordBot from "./classes/Discord";
const client = new DiscordBot();
client.start();
