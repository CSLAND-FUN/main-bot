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
    if (oldState.member.user.bot || newState.member.user.bot) return;
    if (!oldState.channel && !newState.channel) return;
    if (oldState.channel && !newState.channel) return;

    const data = await client
      .sql<VoiceInformation>("voice_stats")
      .select()
      .where({
        channel_id: newState.channel.id,
        userID: newState.member.id,
      })
      .finally();

    if (!data.length) {
      const date = new Date();
      const day = Number(String(date.getDate()).padStart(2, "0"));

      const month = date.getMonth() + 1;
      const year = date.getFullYear();
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
