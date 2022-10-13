import DiscordBot from "@src/classes/Discord";
import { Event } from "@src/classes/Event";
import { bold, EmbedBuilder, GuildMember } from "discord.js";

export = class GuildMemberAddEvent extends Event {
  constructor() {
    super("guildMemberAdd");
  }

  async run(client: DiscordBot, member: GuildMember) {
    client.bonuses.data(member.id);

    const channel = member.guild.channels.cache.get("937777349477404703");
    if (!channel.isTextBased()) return;

    const out = [];
    out.push(
      bold(
        `${member.toString()}, добро пожаловать на официальный сервер проекта CsLand!`
      ),
      bold(`Перед началом общения ознакомьтесь с <#936334109041647687>.`),
      "",
      bold("Ссылки на нас:"),
      bold(`Сайт - https://csland.fun/`),
      bold(`Telegram - https://t.me/csland_project`),
      bold(`VK Группа - https://vk.com/csland_project`),
      bold(`TikTok - https://www.tiktok.com/@cs.land`),
      bold(
        `YouTube Основателя - https://www.youtube.com/channel/UC8jfl3q-PGVD3yu8IP2H2cQ`
      )
    );

    const embed = new EmbedBuilder();
    embed.setColor("DarkPurple");
    embed.setAuthor({
      name: member.user.tag,
      iconURL: member.avatarURL(),
    });
    embed.setDescription(out.join("\n"));

    await channel.send({
      content: member.toString(),
      embeds: [embed],
    });
  }
};
