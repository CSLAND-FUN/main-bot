import { APIEmbedField, Message, bold, userMention } from "discord.js";
import { Command, CommandCategory } from "@src/classes/Command";
import { ClanInvite } from "@modules/clans";
import DiscordBot from "@src/classes/Discord";

export = class ClanCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.CLANS,
      name: "clan",

      description: "Получает информацию клана.",
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

    var clans = await client.clans.getClans();
    const clan = await client.clans.getUserClan(message.author.id);
    if (!clan) {
      const embed = this.embed("Red", bold("Клан не найден!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    clans = clans.sort((a, b) => b.members - a.members);
    const index = clans.findIndex((c) => c.owner === clan.owner) + 1;
    const TYPES = {
      0: "Закрытый",
      1: "Открытый",
    };

    const invites = await client.clans
      .sql<ClanInvite>("clans_invites")
      .select()
      .where({
        clanID: clan.id,
      })
      .finally();

    const data = [
      bold(`› Название клана: ${clan.name}`),
      bold(`› Тег клана: [${clan.tag}]`),
      bold(`› Тип клана: ${TYPES[clan.type]}`),
      bold(`› Описание: ${clan.description}`),
      bold(`› Участников: ${clan.members}`),
      bold(`› Владелец: ${userMention(clan.owner)}`),
      bold(`› Место в топе: ${index}`),
      invites.length ? bold(`› Заявок на вступление: ${invites.length}`) : "",
    ].join("\n");

    const AboutField: APIEmbedField = {
      name: "О клане:",
      value: [
        `› Место в топе: ${index.toLocaleString("be")}`,
        `› Название клана: ${clan.name}`,
        `› Клан Тег: [${clan.tag}]`,
        `› Описание клана: ${clan.description}`,
        `› Количество участников: ${clan.members.toLocaleString("be")}`,
        `› Владелец клана: ${clan.members.toLocaleString("be")}`,
      ]
        .map((str) => {
          if (str === "") return "";
          else return bold(str);
        })
        .join("\n"),

      inline: true,
    };

    const InvitesField: APIEmbedField = {
      name: "Заявки на вступление:",
      value: [
        `› Тип клана: ${TYPES[clan.type]}`,
        `› Количество заявок: ${
          invites.length > 1 ? invites.length : "Отсутствуют"
        }`,
        "",
        clan.type === 0
          ? "Заявки на вступление необходимо рассматривать используя команду `!clan-invites`"
          : "В клан может вступить любой желающий",
      ]
        .map((str) => {
          if (str === "") return "";
          else return bold(str);
        })
        .join("\n"),

      inline: true,
    };

    const embed = this.embed("DarkPurple", null);
    embed.addFields(AboutField, InvitesField);

    return message.reply({
      embeds: [embed],
    });
  }
};
