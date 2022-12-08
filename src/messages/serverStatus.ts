import DiscordBot from "@src/classes/Discord";
import Logger from "@src/classes/Logger";
import getServers from "@src/functions/getServers";

import { EmbedBuilder, Message, TextChannel } from "discord.js";

export default async function serverStatus(client: DiscordBot) {
  Logger.log("Initialized ServerStatus Message!", "CSLAND");

  const channel = (await client.channels.fetch(
    process.env.STATUS_CHANNEL_ID
  )) as TextChannel;

  const embed = new EmbedBuilder();
  embed.setColor("DarkPurple");
  embed.setAuthor({
    name: "CSLAND | Статус серверов",
    iconURL: client.user.avatarURL({ size: 2048, forceStatic: true }),
  });

  const msg = await channel.send({
    embeds: [embed],
  });

  await editMessage(embed, msg);
  setInterval(async () => {
    await editMessage(embed, msg);
  }, 600000);
}

async function editMessage(embed: EmbedBuilder, msg: Message) {
  const servers = await getServers();
  const max_online = 90;
  var online = 0;

  for (const server of servers) online += server.players;

  const percent = Math.floor((100 * online) / max_online) + "/100%";
  embed.data.description = `**Общий онлайн на серверах**: **${online}/90 | ${percent}**`;

  for (const server of servers) {
    const display_ip = `${server.host}:${server.port}`;
    embed.data.description += [
      "\n",
      `› **${server.server} | ${display_ip}:**`,
      `› **Подключиться**: **steam://connect/${display_ip}**`,
      `› **Статус**: **\`${server.status}\`**`,
      `› **Карта**: **\`${server.map}\`**`,
      `› **Игроков**: **\`${server.players}\`**`,
    ].join("\n");
  }

  await msg.edit({
    embeds: [embed],
  });
}
