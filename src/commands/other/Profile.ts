import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { bold, EmbedBuilder, Message } from "discord.js";

import { FormData, request } from "undici";
const BASE_URL = "https://csland.fun/ajax/api/index.php";

export = class HelpCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.OTHER,
      name: "profile",

      description: "Позволяет найти ваш профиль на CSLAND.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const id = args[0];
    if (!id || !Number(id)) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("Укажите ID пользователя!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const form = new FormData();
    form.append("getProfileInfo", 1);
    form.append("id", id);

    const req = await (
      await request(BASE_URL, {
        method: "POST",
        body: form,
      })
    ).body.json();

    if (req.status === 2) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold(req.message),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const { data } = req;
    const route = data.route !== null ? `/${data.route}` : `?id=${data.id}`;
    const url = `https://csland.fun/profile${route}`;
    const avatar = `https://csland.fun/${data.avatar}`;

    const embed = new EmbedBuilder();

    embed.setAuthor({
      name: message.author.tag,
      iconURL: message.author.avatarURL({ forceStatic: true, size: 2048 }),
    });

    embed.setColor("DarkPurple");
    embed.setThumbnail(avatar);
    embed.setTitle(data.login);
    embed.setURL(url);

    var vk = "Не привязан";
    if (data.vk_api !== "0") {
      vk = "https://vk.ru/id607330733";
    }

    var telegram = "Не указан";
    if (data.telegram !== "") {
      telegram = `https://t.me/${data.telegram}`;
    }

    var discord = "Не привязан";
    if (data.discord !== null) {
      discord = data.discord;
    }

    var steam_id = "Не указан";
    if (data.steam_api !== "0") {
      steam_id = data.steam_api;
    }

    embed.addFields(
      {
        name: "[#] Информация профиля:",
        value: [
          `› **ID**: ${bold(data.id)}`,
          `› **Логин**: ${bold(data.login)}`,
          "",
          `› **Имя**: ${bold(data.name)}`,
          `› **Дата регистрации**: ${bold(data.regdate)}`,
          `› **Дата рождения**: ${bold(data.birth)}`,
          "",
          `› **Ник на сервере**: ${bold(data.name)}`,
          `› **Последний раз в сети**: ${bold(data.last_activity)}`,
        ].join("\n"),
      },
      {
        name: "[#] Соц. Сети:",
        value: [
          `› **VK**: ${bold(vk)}`,
          `› **Telegram**: ${bold(telegram)}`,
          `› **Discord**: ${bold(discord)}`,
          `› **Steam ID 64**: ${bold(steam_id)}`,
        ].join("\n"),
        inline: true,
      },
      {
        name: "[#] Статистика:",
        value: [
          `› **Рейтинг**: ${bold(data.reit)}`,
          `› **Спасибок**: ${bold(data.thanks)}`,
          `› **Ответов на форуме**: ${bold(data.answers)}`,
        ].join("\n"),
        inline: true,
      }
    );

    return await message.reply({
      embeds: [embed],
    });
  }
};
