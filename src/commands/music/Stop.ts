import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { bold, Message } from "discord.js";

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

    const queue = client.player.getQueue(message);
    if (!queue) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("❌ | На сервере не проигрывает музыка!")
      );

      return message.reply({
        embeds: [embed],
      });
    }

    try {
      await queue.stop();
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

    const embed = this.embed(
      client,
      message,
      "DarkPurple",
      "user",
      bold("✅ | Очередь песен остановлена!")
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
