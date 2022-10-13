import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { bold, Message } from "discord.js";

export = class LobbyStayCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.LOBBY,
      name: "lobby-stay",

      description: "Оставляет лобби даже если его владелец покинул канал.",
    });
  }

  run(client: DiscordBot, message: Message, args: string[]) {
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

    client.lobbys.editOptions(message.member.voice.channel.id, {
      deleteIfOwnerLeaves: false,
    });

    const embed = this.embed(
      client,
      message,
      "DarkPurple",
      "user",
      bold("✅ | Конфигурация лобби изменена!")
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
