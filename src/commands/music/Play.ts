import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { bold, Message, TextChannel } from "discord.js";

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
        client,
        message,
        "Red",
        "user",
        bold("❌ | Войдите в голосовой канал чтобы продолжить!")
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const input = args.join(" ");

    try {
      await client.player.play(message.member.voice.channel, input, {
        member: message.member,
        message: message,
        textChannel: message.channel as TextChannel,
      });
    } catch (error) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold(error.message)
      );

      return message.reply({
        embeds: [embed],
      });
    }
  }
};
