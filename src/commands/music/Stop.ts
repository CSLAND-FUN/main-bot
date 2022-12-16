import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class StopCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.MUSIC,
      name: "stop",

      description: "Прекращает проигрывание музыки.",
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

    try {
      await queue.stop();
    } catch (error) {
      const embed = this.embed("Red", bold(error.message), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const embed = this.embed(
      "DarkPurple",
      bold("Очередь песен остановлена!"),
      "✅"
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
