import { VoiceState } from "discord.js";
import { Event } from "@src/classes/Event";
import DiscordBot from "@src/classes/Discord";
import Logger from "@src/classes/Logger";

type VoiceInformation = {
  channel_name: string;
  channel_id: string;
  userID: string;

  times: number;
  date: string;
};

export = class VoiceStateUpdateEvent extends Event {
  constructor() {
    super("voiceStateUpdate");
  }

  async run(client: DiscordBot, oldState: VoiceState, newState: VoiceState) {
    if (
      (!oldState.channel && !newState.channel) ||
      (oldState.channel && !newState.channel)
    ) {
      return;
    }

    if (oldState.member.user.bot || newState.member.user.bot) return;
    if (newState.channel.id === process.env.LOBBYS_PARENT_ID) return;

    const data = await client
      .sql<VoiceInformation>("voice_stats")
      .select()
      .where({
        channel_id: newState.channel.id,
        userID: newState.member.id,
      })
      .finally();

    if (!data.length) {
      const date = new Date()
        .toLocaleString("ru", {
          timeZone: "Europe/Moscow",
        })
        .slice(0, 10)
        .replaceAll(".", "-")
        .split("-");

      const day = date[0];
      const month = date[1];
      const year = date[2];

      const format = `${year}-${month}-${day}`;
      await client
        .sql<VoiceInformation>("voice_stats")
        .insert({
          channel_id: newState.channel.id,
          channel_name: newState.channel.name,
          userID: newState.member.id,

          times: 1,
          date: format,
        })
        .finally();

      Logger.log(
        `Added ${newState.member.user.tag} into "voice_stats" table.`,
        "Voice Stats"
      );
    } else {
      await client
        .sql<VoiceInformation>("voice_stats")
        .update({
          times: data[0].times + 1,
        })
        .where({
          channel_id: newState.channel.id,
          userID: newState.member.id,
        })
        .finally();

      Logger.log(
        `Updated statistics for ${newState.member.user.tag}.`,
        "[Voice Stats]"
      );
    }
  }
};
