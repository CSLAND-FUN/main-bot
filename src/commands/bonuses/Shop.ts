import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  Message,
} from "discord.js";
import { Command, CommandCategory } from "@src/classes/Command";
import { HistoryType } from "@modules/bonuses";
import { ROLES } from "@cfgs/shop_roles";

import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";

export = class ShopCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "shop",

      description: "Показывает доступные предметы из магазина системы Бонусов.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const data = await client.bonuses.data(message.author.id);

    const bronzeData = ROLES[0];
    const liteData = ROLES[1];
    const megaData = ROLES[2];

    const bronzeCost = await this.getCost(client, data.id, 1);
    const liteCost = await this.getCost(client, data.id, 2);
    const megaCost = await this.getCost(client, data.id, 3);

    const bronzeText = this.getInfo("bronze", bronzeCost.string);
    const liteText = this.getInfo("lite", liteCost.string);
    const megaText = this.getInfo("mega", megaCost.string);

    const [bronzeEmbed, liteEmbed, megaEmbed] = [
      this.embed("DarkPurple", bronzeText),
      this.embed("DarkPurple", liteText),
      this.embed("DarkPurple", megaText),
    ];

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("buy-bronze")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("1️⃣")
        .setLabel("Купить Bronze")
        .setDisabled(data.roles.includes("1")),

      new ButtonBuilder()
        .setCustomId("buy-lite")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("2️⃣")
        .setLabel("Купить Lite")
        .setDisabled(data.roles.includes("2")),

      new ButtonBuilder()
        .setCustomId("buy-mega")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("3️⃣")
        .setLabel("Купить MEGA")
        .setDisabled(data.roles.includes("3"))
    );

    const msg = await message.reply({
      embeds: [bronzeEmbed, liteEmbed, megaEmbed],
      components: [row],
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
      filter: (b) => b.user.id === message.author.id,
    });

    collector.on("collect", async (btn) => {
      if (!btn.isButton()) return;

      switch (btn.customId) {
        case "buy-bronze": {
          if (data.bonuses < bronzeCost.cost) {
            const diff = bronzeCost.cost - data.bonuses;
            const word = Functions.declOfNum(diff, [
              "бонус",
              "бонуса",
              "бонусов",
            ]);

            const embed = this.embed(
              "Red",
              bold(`Вам не хватает ${diff} ${word} для покупки Bronze!`),
              "❌"
            );

            btn.update({
              embeds: [embed],
              components: [],
            });

            break;
          }

          await client.bonuses.update(
            message.author.id,
            "bonuses",
            data.bonuses - bronzeCost.cost
          );

          await client.bonuses.update(
            message.author.id,
            "roles",
            data.roles + "1"
          );

          message.member.roles.add(bronzeData.id);
          await client.bonuses.createHistoryItem({
            type: HistoryType.BONUS,

            user_id: message.author.id,
            message: "Покупка роли Bronze",

            cost: bronzeCost.cost,
            time: Date.now().toString(),
          });

          const embed = this.embed(
            "DarkPurple",
            bold(`Вы купили Bronze за ${bronzeCost.string}!`),
            "✅"
          );

          btn.update({
            embeds: [embed],
            components: [],
          });

          break;
        }

        case "buy-lite": {
          if (data.bonuses < liteCost.cost) {
            const diff = liteCost.cost - data.bonuses;
            const word = Functions.declOfNum(diff, [
              "бонус",
              "бонуса",
              "бонусов",
            ]);

            const embed = this.embed(
              "Red",
              bold(`Вам не хватает ${diff} ${word} для покупки Lite!`),
              "❌"
            );

            btn.update({
              embeds: [embed],
              components: [],
            });

            break;
          }

          await client.bonuses.update(
            message.author.id,
            "bonuses",
            data.bonuses - liteCost.cost
          );

          await client.bonuses.update(
            message.author.id,
            "roles",
            data.roles + "2"
          );

          message.member.roles.add(liteData.id);
          await client.bonuses.createHistoryItem({
            type: HistoryType.BONUS,

            user_id: message.author.id,
            message: "Покупка роли Lite",

            cost: liteCost.cost,
            time: Date.now().toString(),
          });

          const embed = this.embed(
            "DarkPurple",
            bold(`Вы купили Lite за ${liteCost.string}!`),
            "✅"
          );

          btn.update({
            embeds: [embed],
            components: [],
          });

          break;
        }

        case "buy-mega": {
          if (data.bonuses < megaCost.cost) {
            const diff = megaCost.cost - data.bonuses;
            const word = Functions.declOfNum(diff, [
              "бонус",
              "бонуса",
              "бонусов",
            ]);

            const embed = this.embed(
              "Red",
              bold(`Вам не хватает ${diff} ${word} для покупки MEGA!`),
              "❌"
            );

            btn.update({
              embeds: [embed],
              components: [],
            });

            break;
          }

          await client.bonuses.update(
            message.author.id,
            "bonuses",
            data.bonuses - megaCost.cost
          );

          await client.bonuses.update(
            message.author.id,
            "roles",
            data.roles + "3"
          );

          message.member.roles.add(megaData.id);
          await client.bonuses.createHistoryItem({
            type: HistoryType.BONUS,

            user_id: message.author.id,
            message: "Покупка роли MEGA",

            cost: megaCost.cost,
            time: Date.now().toString(),
          });

          const embed = this.embed(
            "DarkPurple",
            bold(`Вы купили MEGA за ${megaCost.string}!`),
            "✅"
          );

          btn.update({
            embeds: [embed],
            components: [],
          });

          break;
        }
      }
    });

    collector.on("end", async (collected, reason) => {
      if (!collected.size && reason === "time") {
        await message.delete();
        await msg.delete();

        return;
      }
    });
  }

  async getCost(
    client: DiscordBot,
    id: string,
    role_num: number
  ): Promise<{ cost: number; string: string }> {
    const data = await client.bonuses.data(id);

    if (role_num === 1) {
      return {
        cost: 5000,
        string: "5000 бонусов",
      };
    } else if (role_num === 2) {
      if (data.roles.includes("1")) {
        return {
          cost: 7000,
          string: "7000 бонусов",
        };
      }

      return {
        cost: 10000,
        string: "10000 бонусов",
      };
    } else if (role_num === 3) {
      if (data.roles.includes("2")) {
        return {
          cost: 7000,
          string: "7000 бонусов",
        };
      } else if (data.roles.includes("1")) {
        return {
          cost: 12000,
          string: "12000 бонусов",
        };
      }

      return {
        cost: 15000,
        string: "15000 бонусов",
      };
    }
  }

  getInfo(role: "bronze" | "lite" | "mega", cost: string): string {
    var out: string[];

    switch (role) {
      case "bronze": {
        out = [
          "**При покупке Bronze вы получаете:**",
          "- **Уникальный значок рядом с ролью <:bronze_badge:940218435667890216>**",
          "- **Денежный ваучер с суммой 20 рублей.**",
          "",
          `› **Цена**: **${cost}**`,
        ];

        break;
      }

      case "lite": {
        out = [
          "**При покупке Lite вы получаете:**",
          "- **Уникальный значок рядом с ролью <:lite_badge:940218368319975424>**",
          "- **Возможность создавать приватные лобби.**",
          "- **Денежный ваучер с суммой 30 рублей.**",
          "",
          `› **Цена**: **${cost}**`,
        ];

        break;
      }

      case "mega": {
        out = [
          "**При покупке MEGA вы получаете:**",
          "- **Уникальный значок рядом с ролью <:mega_badge:940218408845332510>**",
          "- **Возможность загружать файлы и картинки в общие чаты.**",
          "- **Использовать эмодзи и стикеры с других серверов.**",
          "- **Возможность создавать и настраивать приватные лобби.**",
          "- **Денежный ваучер с суммой 50 рублей.**",
          "",
          `› **Цена**: **${cost}**`,
        ];

        break;
      }
    }

    return out.join("\n");
  }
};
