import DiscordBot from "@src/classes/Discord";
import { Event } from "@src/classes/Event";
import { Message } from "discord.js";
import config from "../config.json";

export = class MessageCreateEvent extends Event {
  constructor() {
    super("messageCreate");
  }

  async run(client: DiscordBot, message: Message) {
    if (!message.inGuild() || message.author.bot) return;
    if (!message.content.startsWith("!")) return;

    const args = message.content.slice("!".length).trim().split(" ");
    const cmd = args.shift().toLowerCase();

    // prettier-ignore
    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (!command) {
      return await message.react("❌");
    }

    if (
      command.data.ownerOnly === true &&
      !config.OWNERS.includes(message.author.id)
    ) {
      return await message.react("❌");
    }

    if (
      command.data.permissions &&
      !message.member.permissions.has(command.data.permissions)
    ) {
      return await message.react("❌");
    }

    await command.run(client, message, args);
    await message.react("✅");
  }
};
