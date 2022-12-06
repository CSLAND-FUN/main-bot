import { EmbedBuilder, GuildMember } from "discord.js";
import { Event } from "@src/classes/Event";
import { WELCOME_CHANNEL_ID, AUTOROLE_ID } from "@src/config.json";
import DiscordBot from "@src/classes/Discord";

export = class GuildMemberAddEvent extends Event {
  constructor() {
    super("guildMemberAdd");
  }

  async run(client: DiscordBot, member: GuildMember) {
    const role = member.guild.roles.cache.get(AUTOROLE_ID);
    if (role) await member.roles.add(role);

    await client.bonuses.data(member.id);

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel.isTextBased()) return;

    const out = [
      `**${member.toString()}, добро пожаловать на официальный сервер проекта CsLand!**`,
      `**Перед началом общения ознакомьтесь с <#936334109041647687>.**`,
      "",
      "**Ссылки на нас:**",
      `**Сайт - https://csland.fun/**`,
      `**Telegram - https://t.me/csland_project**`,
      `**Группа в VK - https://vk.com/csland_project**`,
      `**TikTok - https://www.tiktok.com/@cs.land**`,
      `**YouTube Основателя - https://www.youtube.com/channel/UC8jfl3q-PGVD3yu8IP2H2cQ**`,
    ].join("\n");

    const embed = new EmbedBuilder();
    embed.setColor("DarkPurple");
    embed.setDescription(out);

    await channel.send({
      content: member.toString(),
      embeds: [embed],
    });
  }
};
