/*
  ! Новогодняя раздача действует с 31.12.2022 по 08.01.2023
  
  ? Есть 4 типа возможных подарков:
  ? - Бонусы;
  ? - Ваучер на деньги;
  ? - Ваучер на скидку;
  ? - Промокод на скидку [промокод - одноразовый ваучер];

  ? Подарок определяется путём случайного выбора.
*/

import { bold, Message, TextChannel } from "discord.js";
import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";

import { FormData, request } from "undici";
import random from "random";

const ms = 86400000;

export = class NewYearCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.OTHER,
      name: "newyear",

      description: "Ежедневная новогодняя раздача в течение Нового Года.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const data = await client.bonuses.data(message.author.id);
    const next_time = Number(data.newyear_used) + ms;

    if (data.newyear_used !== null && Date.now() < next_time) {
      // prettier-ignore
      const date = new Date(next_time).toLocaleString("ru", { timeZone: "Europe/Moscow" });
      const embed = this.embed(
        "Red",
        bold(
          [
            `Вы уже получили ежедневный новогодний бонус!`,
            `Ждём вас ${date}`,
          ].join("\n")
        ),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const give_bonuses = random.int(0, 1) === 0 ? false : true;
    const random_choose = [1, 1, 1, 2, 3, 3, 3];
    const pick =
      give_bonuses === false
        ? random_choose[Math.floor(Math.random() * random_choose.length)]
        : random.int(100, 250);

    if (give_bonuses === false) {
      var value = 0;

      if (pick === 1) {
        value = random.int(30, 50); //? От 30 до 50 рублей
      } else if (pick === 2) {
        value = random.int(10, 20); //? От 10 до 20%
      } else if (pick === 3) {
        value = random.int(15, 30); //? От 15 до 30%
      }

      const form = new FormData();
      form.append("generate", 1);
      form.append("type", pick);
      form.append("value", value);

      const data = await (
        await request(process.env.API_BASE_URL, {
          body: form,
          method: "POST",

          headers: {
            TOKEN: process.env.API_SECRET_TOKEN,
          },
        })
      ).body.json();

      if (data.success === false) {
        const embed = this.embed(
          "Red",
          bold(
            `Произошла неизвестная ошибка, упомяните скриптера для решения проблемы!`
          ),
          "❌"
        );

        return message.reply({
          embeds: [embed],
        });
      }

      const embed = this.embed(
        "DarkPurple",
        bold(
          [
            `В качестве новогоднего подарка вы получили ${data.pretty_type}!`,
            `Ваша награда будет отправлена в личные сообщения!`,
          ].join("\n")
        ),
        "🎁"
      );

      message.reply({
        embeds: [embed],
      });

      const to_user = this.embed(
        "DarkPurple",
        bold(
          [
            `Вот ваша награда - ${data.pretty_type}!`,
            `› Ключ: ${data.key}`,
            `› Сумма: ${data.val}`,
          ].join("\n")
        ),
        "🎁"
      );

      try {
        await message.author.send({
          embeds: [to_user],
        });
      } catch (e) {
        const embed = this.embed(
          "Red",
          bold(
            `У меня не получилось отправить вам сообщение в ЛС, упомяните скриптера для получения подарка!`
          ),
          "❌"
        );

        return message.channel.send({
          content: message.author.toString(),
          embeds: [embed],
        });
      }

      const info_embed = this.embed(
        "DarkPurple",
        bold(
          [
            `› Пользователь: ${message.author.toString()}`,
            `› Тип: ${data.pretty_type}`,
            `› Ключ: ||${data.key}||`,
            `› Сумма/Скидка: ${data.val}`,
          ].join("\n")
        )
      );

      const channel = message.guild.channels.cache.get(
        process.env.NOTIFICATIONS_CHANNEL_ID
      ) as TextChannel;

      channel.send({
        embeds: [info_embed],
      });

      return;
    }

    await client.bonuses.update(
      message.author.id,
      "newyear_used",
      Date.now().toString()
    );

    await client.bonuses.update(
      message.author.id,
      "bonuses",
      data.bonuses + pick
    );

    const word = Functions.declOfNum(pick, ["бонус", "бонуса", "бонусов"]);
    const embed = this.embed(
      "DarkPurple",
      bold(`В качестве новогоднего подарка вы получили ${pick} ${word}!`),
      "🎁"
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
