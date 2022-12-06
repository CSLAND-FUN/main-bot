import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { bold, hyperlink, Message } from "discord.js";

export = class NowPlayingCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.MUSIC,
      name: "nowplaying",

      aliases: ["np"],
      description: "Показывает текущую песню.",
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

    const queue = client.player.getQueue(message);
    if (!queue) {
      const embed = this.embed(
        "Red",
        bold("На сервере не проигрывает музыка!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const song = queue.songs[0];
    const embed = this.embed(
      "DarkPurple",
      bold(
        [
          `Сейчас играет ${hyperlink(song.name, song.url)}!`,
          `Запросил: ${song.user.toString()}!`,
        ].join("\n")
      )
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
