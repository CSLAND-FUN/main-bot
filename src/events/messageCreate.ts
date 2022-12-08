import { Message } from "discord.js";
import { Event } from "@src/classes/Event";
import DiscordBot from "@src/classes/Discord";

export = class MessageCreateEvent extends Event {
  constructor() {
    super("messageCreate");
  }

  async run(client: DiscordBot, message: Message) {
    if (!message.inGuild() || message.author.bot) return;
    if (!message.content.startsWith("!")) return;
    if (message.channel.id !== process.env.COMMANDS_CHANNEL_ID) return;

    const args = message.content.slice("!".length).trim().split(" ");
    const cmd = args.shift().toLowerCase();

    // prettier-ignore
    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (!command) {
      return message.react("❌");
    }

    const owners = process.env.OWNERS.split(",");
    if (
      command.data.ownerOnly === true &&
      !owners.includes(message.author.id)
    ) {
      return message.react("❌");
    }

    if (
      command.data.permissions &&
      !message.member.permissions.has(command.data.permissions)
    ) {
      return message.react("❌");
    }

    await command.run(client, message, args);
    await message.react("✅");
  }
};
