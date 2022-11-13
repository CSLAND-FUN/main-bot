import DiscordBot from "@src/classes/Discord";
import getServers from "@src/functions/getServers";

import { EmbedBuilder, Message, TextChannel } from "discord.js";
import { WELCOME_CHANNEL_ID } from "../config.json";

export default async function serverStatus(client: DiscordBot) {
  const channel = (await client.channels.fetch(
    WELCOME_CHANNEL_ID
  )) as TextChannel;

  const embed = new EmbedBuilder();
  embed.setColor("DarkPurple");
  embed.setAuthor({
    name: "CSLAND | Статус серверов",
    iconURL: client.user.avatarURL({ size: 2048 }),
  });
  embed.setDescription("**— Статус серверов —**");

  const msg = await channel.send({
    embeds: [embed],
  });

  await editMessage(embed, msg);
  setInterval(async () => {
    await editMessage(embed, msg);
  }, 300000);
}

async function editMessage(embed: EmbedBuilder, msg: Message) {
  embed.data.description = "**— Статус серверов —**";

  const servers = await getServers();
  var online = 0;

  for (const server of servers) {
    const display_ip = `${server.host}:${server.port}`;
    embed.data.description += [
      "\n",
      `› **${server.server} | ${display_ip}:**`,
      `› **Статус**: **\`${server.status}\`**`,
      `› **Карта**: **\`${server.map}\`**`,
      `› **Игроков**: **\`${server.players}\`**`,
    ].join("\n");

    online += server.players;
  }

  const max_online = 90;
  const percent = Math.floor((100 * online) / max_online) + "% из 100%";

  embed.data.description += [
    "\n",
    `**Общий онлайн на серверах**: **${percent}**`,
  ].join("\n");

  await msg.edit({
    embeds: [embed],
  });
}
