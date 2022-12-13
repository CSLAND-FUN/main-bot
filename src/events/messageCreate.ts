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
    if (
      ![
        process.env.TEST_CHANNEL_ID,
        process.env.COMMANDS_CHANNEL_ID,
        process.env.SETTINGS_CHANNEL_ID,
        process.env.NEWS_CHANNEL_ID,
      ].includes(message.channel.id)
    ) {
      return;
    }

    const args = message.content.slice("!".length).trim().split(" ");
    const cmd = args.shift().toLowerCase();

    // prettier-ignore
    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (!command) return;

    const owners = process.env.OWNERS.split(",");
    if (
      command.data.ownerOnly === true &&
      !owners.includes(message.author.id)
    ) {
      return;
    }

    if (
      command.data.permissions &&
      !message.member.permissions.has(command.data.permissions)
    ) {
      return;
    }

    await command.run(client, message, args);
  }
};
