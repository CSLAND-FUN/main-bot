import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";

type VoiceInformation = {
  channel_name: string;
  channel_id: string;
  userID: string;

  times: number;
  date: string;
};

export = class VoiceStatsCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.OWNER,
      name: "voicestats",

      description: "Показывает статистику голосового канала за прошедший день.",
      ownerOnly: true,
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const date = new Date();
    const day = Number(String(date.getDate()).padStart(2, "0")) - 1;

    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const format = `${year}-${month}-${day}`;

    const data = await client
      .sql<VoiceInformation>("voice_stats")
      .select()
      .where({
        date: format,
      })
      .finally();

    if (!data.length) {
      const embed = this.embed(
        "Red",
        bold("Не удалось найти статистику за сегодняшний день!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const stats = [];
    await message.guild.members.fetch();
    for (const stat of data) {
      const _member = message.guild.members.cache.get(stat.userID);
      const word = Functions.declOfNum(stat.times, ["раз", "раза", "раз"]);

      const member = `${_member.toString()} \`(${_member.user.tag})\``;
      const channel = `\`${stat.channel_name} (${stat.channel_id})\``;
      const times = `\`${stat.times} ${word}\``;

      stats.push(bold(`› ${member}\n» ${channel}\n» ${times}`));
    }

    const embed = this.embed(
      "DarkPurple",
      stats.join("\n— — — — — — — — — — — — — — —\n")
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
