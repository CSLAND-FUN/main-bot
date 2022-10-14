import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { bold, Message } from "discord.js";

export = class LobbyDelAccessCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.LOBBY,
      name: "lobby-delaccess",

      aliases: ["lobby-revoke", "l-del"],
      description: "Выдаёт доступ участнику/роли.",
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

    const member_or_role =
      message.mentions.members.first() || message.mentions.roles.first();

    if (!member_or_role) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("❌ | Упомяните роль или участника!")
      );

      return message.reply({
        embeds: [embed],
      });
    }

    client.lobbys.revokeAccess(message.member.voice.channel.id, member_or_role);

    const embed = this.embed(
      client,
      message,
      "DarkPurple",
      "user",
      bold(`✅ | Был убран доступ для ${member_or_role.toString()}!`)
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
