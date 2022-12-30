import { EmbedBuilder, Message, bold } from "discord.js";
import { Event } from "@src/classes/Event";
import { time } from "discord.js";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";

type TimestampUser = {
  time: number;
  next_use: number;
};

const timestamps: Map<string, TimestampUser> = new Map();

export = class MessageCreateEvent extends Event {
  constructor() {
    super("messageCreate");
  }

  async run(client: DiscordBot, message: Message) {
    if (
      !message.inGuild() ||
      message.guild.id !== process.env.SERVER_ID ||
      message.author.bot
    ) {
      return;
    }

    if (!message.content.startsWith("!")) return;
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

    if (
      command.data.cooldown !== null &&
      timestamps.has(`${command.data.name}-${message.author.id}`)
    ) {
      const data = timestamps.get(`${command.data.name}-${message.author.id}`);
      const _time = Math.ceil(data.next_use / 1000);

      const embed = new EmbedBuilder();
      embed.setColor("Red");
      embed.setAuthor(Functions.getAuthor(message));
      embed.setDescription(
        bold(`❌ | Используйте команду ещё раз ${time(_time, "R")}`)
      );
      embed.setTimestamp();

      return message.reply({
        embeds: [embed],
      });
    }

    if (command.data.cooldown !== null) {
      await command.run(client, message, args);

      timestamps.set(`${command.data.name}-${message.author.id}`, {
        time: command.data.cooldown,
        next_use: Date.now() + command.data.cooldown,
      });

      setTimeout(() => {
        timestamps.delete(`${command.data.name}-${message.author.id}`);
      }, command.data.cooldown);

      return;
    } else {
      await command.run(client, message, args);

      return;
    }
  }
};
