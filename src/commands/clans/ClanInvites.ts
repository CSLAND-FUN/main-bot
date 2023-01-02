import { Command, CommandCategory } from "@src/classes/Command";
import { Message, bold } from "discord.js";
import { ClanInvite } from "@modules/clans";
import DiscordBot from "@src/classes/Discord";

export = class ClanInvitesCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.CLANS,
      name: "clan-invites",

      description: "Получает заявки на вступление в клан.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const blacklisted = await client.bonuses.isBlacklisted(message);
    if (blacklisted === true) {
      const embed = this.embed(
        "Red",
        bold("Вы находитесь в чёрном списке!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const isInClan = await client.clans.isInClan(message.author.id);
    if (isInClan === false) {
      const embed = this.embed("Red", bold("Вы не состоите в клане!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const clan = await client.clans.getUserClan(message.author.id);
    if (!clan) {
      const embed = this.embed("Red", bold("Клан не найден!"), "❌");
      return message.channel.send({
        content: message.author.toString(),
        embeds: [embed],
      });
    }

    if (clan.owner !== message.author.id) {
      const embed = this.embed(
        "Red",
        bold("Заявки на вступление может рассматривать только владелец клана!"),
        "❌"
      );

      return message.channel.send({
        content: message.author.toString(),
        embeds: [embed],
      });
    }

    const invites = await client.clans
      .sql<ClanInvite>("clans_invites")
      .select()
      .where({
        clanID: clan.id,
      })
      .finally();

    const data = [];

    await message.guild.members.fetch();
    for (const invite of invites) {
      const member = message.guild.members.cache.get(invite.userID);
      const date = invite.date
        .toLocaleString("ru", {
          timeZone: "Europe/Moscow",
        })
        .slice(0, 10);

      data.push(
        [
          bold(`› Пользователь: ${member.toString()}`),
          bold(`› Дата подачи: ${date}`),
          bold(`› Принять заявку: \`!clan-accept ${invite.id}\``),
          "",
        ].join("\n")
      );
    }

    const embed = this.embed("DarkPurple", data.join("\n"));
    return message.reply({
      embeds: [embed],
    });
  }
};
