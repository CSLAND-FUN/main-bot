import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { bold, Message } from "discord.js";

export = class LobbySizeCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.LOBBY,
      name: "lobby-size",

      description: "Меняет лимит участников в лобби (0 чтобы убрать лимит).",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    if (!message.member.voice.channel) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("❌ | Создайте лобби чтобы продолжить!")
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const lobby = client.lobbys.checkLobby(message.member.voice.channel.id);
    if (!lobby) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold(
          "❌ | Не удалось найти лобби с таким ID, скорее всего вы зашли в публичное лобби!"
        )
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const permission = client.lobbys.checkPermissions(
      message.member.voice.channel.id,
      message.author.id
    );

    if (!permission) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("❌ | У вас нет прав редактировать данное лобби!")
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const limit = args[0];
    if (limit === "0") {
      client.lobbys.editMembers(message.member.voice.channel.id, 0);
    } else if (
      (limit && !Number(limit)) ||
      (limit && limit.includes("-")) ||
      (limit && (limit as unknown as number) > 99)
    ) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("❌ | Укажите новый лимит участников (число от 0 до 99)!")
      );

      return message.reply({
        embeds: [embed],
      });
    }

    client.lobbys.editMembers(
      message.member.voice.channel.id,
      (limit as unknown as number) ?? 25
    );

    const embed = this.embed(
      client,
      message,
      "DarkPurple",
      "user",
      bold("✅ | Конфигурация лобби изменена!")
    );

    const msg = await message.reply({
      embeds: [embed],
    });

    setTimeout(async () => {
      await msg.delete();
      await message.delete();
    }, 2000);
  }
};
