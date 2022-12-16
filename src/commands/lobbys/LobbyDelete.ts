import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class LobbyDeleteCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.LOBBY,
      name: "lobby-delete",

      aliases: ["l-del", "l-delete"],
      description: "Удалит ли лобби после выхода владельца из него.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    if (!message.member.voice.channel) {
      const embed = this.embed(
        "Red",
        bold("Создайте лобби чтобы продолжить!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const lobby = client.lobbys.checkLobby(message.member.voice.channel.id);
    if (!lobby) {
      const embed = this.embed(
        "Red",
        bold("Не удалось найти лобби с таким ID!"),
        "❌"
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
        "Red",
        bold("У вас нет прав редактировать данное лобби!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    client.lobbys.editOptions(message.member.voice.channel.id, {
      deleteIfOwnerLeaves: true,
    });

    const embed = this.embed(
      "DarkPurple",
      bold("Конфигурация лобби изменена!"),
      "✅"
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
