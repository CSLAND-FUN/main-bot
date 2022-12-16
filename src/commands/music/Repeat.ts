import { bold, Message, underscore } from "discord.js";
import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";

export = class RepeatCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.MUSIC,
      name: "repeat",

      aliases: ["loop"],
      description: "Ставит песню/очередь на повтор.",
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

    var mode = null;
    switch (args[0]) {
      case "off": {
        mode = 0;
        break;
      }

      case "song": {
        mode = 1;
        break;
      }

      case "queue": {
        mode = 2;
        break;
      }

      default: {
        mode = 1;
        break;
      }
    }

    mode = queue.setRepeatMode(mode);
    mode = mode ? (mode === 2 ? "очередь" : "песню") : "выключен";

    const queue_underscore = underscore("очередь");
    const song_underscore = underscore("песню");

    const newQueue = client.player.getQueue(message.guild.id);
    const text = newQueue.repeatMode
      ? newQueue.repeatMode === 2
        ? `Режим повтора поставлен на ${queue_underscore}!\n\nЧтобы выключить, введите \`!repeat off\`\nЧтобы поставить режим повтора песни, введите \`!repeat song\``
        : `Режим повтора поставлен на ${song_underscore}!\n\nЧтобы выключить, введите \`!repeat off\`\nЧтобы поставить режим повтора очереди, введите \`!repeat queue\``
      : "Режим повтора отключён!";

    const embed = this.embed("DarkPurple", bold(text));
    return message.reply({
      embeds: [embed],
    });
  }
};
