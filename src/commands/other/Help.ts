import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { APIEmbedField, bold, Message } from "discord.js";

export = class HelpCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.OTHER,
      name: "help",

      description: "Показывает список доступных команд.",
    });
  }

  run(client: DiscordBot, message: Message, args: string[]) {
    const embed = this.embed(
      "DarkPurple",
      bold("Вот команды, которые доступны вам."),
      "💬"
    );

    const fields = this.getCommands(client, message);
    embed.addFields(fields as APIEmbedField[]);

    return message.reply({
      embeds: [embed],
    });
  }

  getCommands(client: DiscordBot, message: Message) {
    //? [Fields | Start]
    var BonusesField: { name?: string; value?: string; inline?: boolean } = {};
    var OtherField: { name?: string; value?: string; inline?: boolean } = {};
    var LobbysField: { name?: string; value?: string; inline?: boolean } = {};
    var ModerationField: { name?: string; value?: string; inline?: boolean } = {}; // prettier-ignore
    var MusicField: { name?: string; value?: string; inline?: boolean } = {};
    var ClansField: { name?: string; value?: string; inline?: boolean } = {};
    var OwnerField: { name?: string; value?: string; inline?: boolean } = {};

    BonusesField.name = "🪙 Система Бонусов";
    OtherField.name = "🫣 Другие команды";
    LobbysField.name = "🔊 Конфигурация лобби";
    ModerationField.name = "🛡️ Модерация";
    MusicField.name = "🎵 Музыка";
    ClansField.name = "⚔ Кланы";
    OwnerField.name = "⚠️ Для разработчика";
    //? [Fields | End]

    //? [Bonus Commands | Start]
    const BonusOut = [];
    const BonusCommands = client.commands
      .filter((c) => c.data.category === CommandCategory.BONUSES)
      .values();

    for (const { data } of BonusCommands) {
      const aliases = data.aliases
        ? ` (${data.aliases.map((a) => `\`!${a}\``).join(" | ")})`
        : "";

      BonusOut.push(`\`!${data.name}\`${aliases} - ${bold(data.description)}`);
    }
    //? [Bonus Commands | End]

    //? [Other Commands | Start]
    const OtherOut = [];
    const OtherCommands = client.commands
      .filter((c) => c.data.category === CommandCategory.OTHER)
      .values();

    for (const { data } of OtherCommands) {
      const aliases = data.aliases
        ? ` (${data.aliases.map((a) => `\`!${a}\``).join(" | ")})`
        : "";

      OtherOut.push(`\`!${data.name}\`${aliases} - ${bold(data.description)}`);
    }
    //? [Bonus Commands | End]

    //? [Lobbys Commands | Start]
    const LobbysOut = [];
    const LobbysCommands = client.commands
      .filter((c) => c.data.category === CommandCategory.LOBBY)
      .values();

    for (const { data } of LobbysCommands) {
      const aliases = data.aliases
        ? ` (${data.aliases.map((a) => `\`!${a}\``).join(" | ")})`
        : "";

      LobbysOut.push(`\`!${data.name}\`${aliases} - ${bold(data.description)}`);
    }
    //? [Lobbys Commands | End]

    //? [Moderation Commands | Start]
    const ModerationOut = [];
    const ModerationCommands = client.commands
      .filter((c) => c.data.category === CommandCategory.MODERATION)
      .values();

    for (const { data } of ModerationCommands) {
      const aliases = data.aliases
        ? ` (${data.aliases.map((a) => `\`!${a}\``).join(" | ")})`
        : "";

      ModerationOut.push(
        `\`!${data.name}\`${aliases} - ${bold(data.description)}`
      );
    }
    //? [Moderation Commands | End]

    //? [Music Commands | Start]
    const MusicOut = [];
    const MusicCommands = client.commands
      .filter((c) => c.data.category === CommandCategory.MUSIC)
      .values();

    for (const { data } of MusicCommands) {
      const aliases = data.aliases
        ? ` (${data.aliases.map((a) => `\`!${a}\``).join(" | ")})`
        : "";

      MusicOut.push(`\`!${data.name}\`${aliases} - ${bold(data.description)}`);
    }
    //? [Music Commands | End]

    //? [Clans Commands | Start]
    const ClansOut = [];
    const ClansCommands = client.commands
      .filter((c) => c.data.category === CommandCategory.CLANS)
      .values();

    for (const { data } of ClansCommands) {
      const aliases = data.aliases
        ? ` (${data.aliases.map((a) => `\`!${a}\``).join(" | ")})`
        : "";

      ClansOut.push(`\`!${data.name}\`${aliases} - ${bold(data.description)}`);
    }
    //? [Clans Commands | End]

    //? [Owner Commands | Start]
    const OwnerOut = [];
    const OwnerCommands = client.commands
      .filter((c) => c.data.category === CommandCategory.OWNER)
      .values();

    for (const { data } of OwnerCommands) {
      const aliases = data.aliases
        ? ` (${data.aliases.map((a) => `\`!${a}\``).join(" | ")})`
        : "";

      OwnerOut.push(`\`!${data.name}\`${aliases} - ${bold(data.description)}`);
    }
    //? [Owner Commands | End]

    BonusesField.value = BonusOut.join("\n");
    OtherField.value = OtherOut.join("\n");
    LobbysField.value = LobbysOut.join("\n");
    ModerationField.value = ModerationOut.join("\n");
    MusicField.value = MusicOut.join("\n");
    ClansField.value = ClansOut.join("\n");
    OwnerField.value = OwnerOut.join("\n");

    const owners = process.env.OWNERS.split(",");
    if (owners.includes(message.author.id)) {
      return [
        BonusesField,
        OtherField,
        LobbysField,
        ModerationField,
        MusicField,
        ClansField,
        OwnerField,
      ];
    } else {
      return [
        BonusesField,
        OtherField,
        LobbysField,
        ModerationField,
        ClansField,
        MusicField,
      ];
    }
  }
};
