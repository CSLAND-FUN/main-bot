import DiscordBot from "@src/classes/Discord";
import { Event } from "@src/classes/Event";
import { Message } from "discord.js";

export = class MessageCreateEvent extends Event {
  constructor() {
    super("messageCreate");
  }

  async run(client: DiscordBot, message: Message) {
    if (!message.inGuild() || message.author.bot) return;
    if (!message.content.startsWith("!!!")) return;

    const args = message.content.slice("!!!".length).trim().split(" ");
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd);
    if (!command) {
      return await message.react("❌");
    }

    if (
      command.data.ownerOnly === true &&
      message.author.id !== "852921856800718908"
    ) {
      return await message.react("❌");
    }

    if (
      command.data.permissions &&
      !message.member.permissions.has(command.data.permissions)
    ) {
      return await message.react("❌");
    }

    await message.react("✅");
    return await command.run(client, message, args);
  }
};
