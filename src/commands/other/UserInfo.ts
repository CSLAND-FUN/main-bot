import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message, time } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class UserInfoCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.OTHER,
      name: "userinfo",

      description: "Выводит информацию пользователя.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;

    if (args[0] && !member) {
      const embed = this.embed(
        "Red",
        bold("Упомяните участника сервера!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    } else if (member.user.bot) {
      const embed = this.embed("Red", bold("Зачем вам информация бота?"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    //? Дата создания и входа на сервер
    const _createdAt = member.user.createdAt;
    const _joinedAt = member.joinedAt;

    const createdAt = `${time(_createdAt)} (${time(_createdAt, "R")})`;
    const joinedAt = `${time(_joinedAt)} (${time(_joinedAt, "R")})`;

    //? Стандартная информация
    const id = member.id;
    const tag = member.user.tag;
    const displayName = member.displayName;

    //? Сторонняя информация
    const data = await client.bonuses.data(member.id);

    const isBlacklisted = data.blacklisted === 1 ? "Да" : "Нет";
    const isCounting = data.counting === 1 ? "Включён" : "Выключен";
    const isVoice = member.voice.channel
      ? member.voice.channel.toString()
      : "Не сидит";

    const embed = this.embed(
      "DarkPurple",
      [
        `Информация пользователя ${member.toString()}`,
        "",
        `› ID: \`${id}\``,
        `› Тег Пользователя: \`${tag}\``,
        `› Ник на сервере: \`${displayName}\``,
        `› Дата регистрации: ${createdAt}`,
        `› Дата входа на сервер: ${joinedAt}`,
        "",
        `› Голосовой канал: ${isVoice}`,
        `› Счёт бонусов: ${isCounting}`,
        `› Бонусов: ${data.bonuses.toLocaleString("be")}`,
        `› Заблокирован в системе: ${isBlacklisted}`,
        data.blacklisted === 1 ? `› Причина: ${data.reason}` : "",
      ]
        .map((str) => (str !== "" ? bold(str) : ""))
        .join("\n")
    );

    embed.setThumbnail(
      member.displayAvatarURL({
        size: 4096,
      })
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
