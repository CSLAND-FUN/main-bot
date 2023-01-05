import { bold, Message, TextChannel } from "discord.js";
import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";

export = class PlayCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.MUSIC,
      name: "play",

      description: "Включает музыку из YouTube или Spotify.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    if (!message.member.voice.channel) {
      const embed = this.embed(
        "Red",
        bold("Войдите в голосовой канал чтобы продолжить!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    if (
      message.guild.members.me.voice.channel &&
      message.guild.members.me.voice.channel.id !==
        message.member.voice.channel.id
    ) {
      const embed = this.embed(
        "Red",
        bold("На текущий момент бот используется в другом Голосовом Канале!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const input = args.join(" ");
    if (!input) {
      const embed = this.embed(
        "Red",
        bold("Напишите название или ссылку на песню!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    try {
      await client.player.play(message.member.voice.channel, input, {
        member: message.member,
        message: message,
        textChannel: message.channel as TextChannel,
      });
    } catch (error) {
      const embed = this.embed("Red", bold(error.message), "❌");
      return message.reply({
        embeds: [embed],
      });
    }
  }
};
