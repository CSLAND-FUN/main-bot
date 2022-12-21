import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Message,
  bold,
} from "discord.js";
import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import EventEmitter from "node:events";

const buttonEmitter = new EventEmitter();

export = class ClanCreateCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.CLANS,
      name: "clan-create",

      description: "Позволяет создать свой собственный клан на сервере.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const isInClan = await client.clans.isInClan(message.author.id);
    if (isInClan) {
      const embed = this.embed("Red", bold("Вы уже состоите в клане!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const clan_name = await this.waitForAnswer(
      "clan_name",
      message,
      "💬 | Напишите название клана (не более 25 символов)",
      35
    );

    if (!clan_name) {
      const embed = this.embed("Red", bold("Вы не написали имя клана!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const clans = await client.clans.getClans();
    if (clans.find((x) => x.name === clan_name)) {
      const embed = this.embed(
        "Red",
        bold("Клан с таким названием уже существует!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const clan_description = await this.waitForAnswer(
      "clan_description",
      message,
      "💬 | Опишите ваш клан (не более 150 символов)",
      40
    );

    const clan_tag = await this.waitForAnswer(
      "clan_tag",
      message,
      "💬 | Напишите тег вашего клана (без скобок/ковычек, не более 15 символов)",
      40
    );

    if (clans.find((x) => x.tag === clan_tag)) {
      const embed = this.embed(
        "Red",
        bold("Клан с таким тегом уже существует!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("closed")
        .setStyle(ButtonStyle.Primary)
        .setLabel("Закрытый")
        .setEmoji("0️⃣"),

      new ButtonBuilder()
        .setCustomId("for_everyone")
        .setStyle(ButtonStyle.Primary)
        .setLabel("Для всех")
        .setEmoji("1️⃣")
    );

    await this.waitForButton(
      "clan_type",
      message,
      row,
      "💬 | Выберите тип вашего клана",
      40
    );

    var clan_type: number = null;
    buttonEmitter.once("gotButton-clan_type", async (type) => {
      if (type === "closed") {
        clan_type = 0;
        return;
      } else if (type === "for_everyone") {
        clan_type = 1;
        return;
      }
    });

    while (clan_type === null) {
      await this.sleep(100);
    }

    const result = await client.clans.createClan(
      message.author.id,
      clan_name,
      clan_description,
      clan_tag,
      clan_type
    );

    if (result.status !== true) {
      const embed = this.embed("Red", bold(result.message), "❌");
      return message.channel.send({
        content: message.author.toString(),
        embeds: [embed],
      });
    }

    const embed = this.embed("DarkPurple", bold(result.message), "✅");
    message.channel.send({
      content: message.author.toString(),
      embeds: [embed],
    });

    const nickname = message.member.displayName;
    return await message.member.edit({
      nick: `[${clan_tag}] ${nickname}`,
    });
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async waitForAnswer(
    id: string,
    message: Message,
    question: string,
    seconds: number
  ) {
    const embed = new EmbedBuilder()
      .setColor("DarkPurple")
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL({ forceStatic: true }),
      })
      .setDescription(bold(question))
      .setFooter({
        text: `Время на ответ - ${seconds} секунд.`,
      });

    await message.channel.send({
      content: message.author.toString(),
      embeds: [embed],
    });

    const collected = await message.channel.awaitMessages({
      filter: (m) => m.author.id === message.author.id,
      time: seconds * 10000,
      max: 1,
    });

    if (collected.size) {
      const msg = collected.first();

      if (id === "clan_name" && msg.content.length > 25) {
        await msg.reply({
          embeds: [
            this.embed(
              "Red",
              [
                "Название клана не может быть более 25 символов.",
                "Используйте команду ещё раз!",
              ].join("\n"),
              "❌"
            ),
          ],
        });

        return;
      } else if (id === "clan_description" && msg.content.length > 150) {
        await msg.reply({
          embeds: [
            this.embed(
              "Red",
              [
                "Описание клана не может быть более 150 символов.",
                "Используйте команду ещё раз!",
              ].join("\n"),
              "❌"
            ),
          ],
        });

        return;
      } else if (id === "clan_tag" && msg.content.length > 15) {
        await msg.reply({
          embeds: [
            this.embed(
              "Red",
              [
                "Тег клана не может быть более 15 символов.",
                "Используйте команду ещё раз!",
              ].join("\n"),
              "❌"
            ),
          ],
        });

        return;
      }

      return msg.content;
    } else {
      return null;
    }
  }

  async waitForButton(
    id: string,
    message: Message,
    row: ActionRowBuilder<ButtonBuilder>,
    question: string,
    seconds: number
  ) {
    const embed = new EmbedBuilder()
      .setColor("DarkPurple")
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL({ forceStatic: true }),
      })
      .setDescription(bold(question))
      .setFooter({
        text: `Время на взаимодействие - ${seconds} секунд.`,
      });

    await message.channel.send({
      content: message.author.toString(),
      embeds: [embed],
      components: [row],
    });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (m) => m.user.id === message.author.id,
      time: seconds * 10000,
      max: 1,
    });

    collector.on("collect", async (btn) => {
      btn.update({
        components: [],
      });

      buttonEmitter.emit(`gotButton-${id}`, btn.customId);
    });
  }
};
