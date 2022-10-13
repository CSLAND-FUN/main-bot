import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";
import { Message, VoiceBasedChannel } from "discord.js";
import Enmap from "enmap";

import { cancelJob, Job, scheduleJob } from "node-schedule";
import random from "random";

interface BonusUser {
  id: string;

  bonuses: number;
  roles: number[];

  counting: boolean;
  blacklisted: boolean;
  reason: string;

  history: UserHistoryItem[];
}

interface UserHistoryItem {
  id?: number;
  type: HistoryType;

  message: string;

  cost: number;
  date: number;
}

export enum HistoryType {
  BONUS = "BONUS",
  PRIVILEGE = "PRIVILEGE",
}

export class BonusSystem {
  public client: DiscordBot;
  public db: Enmap<string, BonusUser>;

  constructor(client: DiscordBot) {
    this.client = client;
    this.db = new Enmap({
      dataDir: "./database",
      name: "bonus-system",
      wal: false,
    });

    const keys = this.db.keys();
    var stopped_to = [];
    for (const key of keys) {
      const data = this.db.ensure(key, {
        id: key,

        bonuses: 0,
        roles: [],

        counting: false,
        blacklisted: false,
        reason: null,

        history: [],
      });

      if (data.counting !== true) continue;

      data.counting = false;
      stopped_to.push(key);

      this.db.set(key, data);
    }

    if (stopped_to.length) {
      console.log(
        `[Bonus System] Stopped counting for ${stopped_to.join(
          ", "
        )} due to restart of the script.`
      );

      stopped_to = [];
    }

    this.handle();
  }

  public startCount(id: string, channel: VoiceBasedChannel) {
    const data = this.db.fetch(id);
    data.counting = true;
    this.db.set(id, data);

    const job: Job = scheduleJob("*/5 * * * *", async () => {
      const newChannel = await this.client.channels.fetch(channel.id);
      if (!newChannel.isVoiceBased()) return cancelJob(job);

      const newData = this.db.fetch(id);
      const members = newChannel.members.filter((m) => {
        const data = this.db.fetch(m.user.id);
        return !m.user.bot || !data.blacklisted;
      });

      if (members.size < 2) {
        const _members = [];
        if (newData.counting === true) {
          newData.counting = false;
        }

        _members.push(newData.id);
        this.db.set(id, newData);

        console.log(
          `[Bonus System] Stopped counting for ${_members.join(", ")}.`
        );

        return cancelJob(job);
      }

      const users = this.db.array();
      for (const u of users) {
        if (u.counting === false) continue;

        const member = newChannel.guild.members.cache.get(u.id);
        if (!member.voice.channel) {
          u.counting = false;
        }

        this.db.set(u.id, u);
      }

      const _new_data = this.db.fetch(newData.id);
      if (_new_data.counting === true) {
        newData.bonuses += random.int(2, 7);
        this.db.set(id, newData);
      }
    });

    return true;
  }

  public blacklist(id: string, reason = "Нарушение правил") {
    const data = this.db.ensure(id, {
      id: id,

      bonuses: 0,
      roles: [],

      counting: false,
      blacklisted: false,
      reason: null,

      history: [],
    });

    data.blacklisted = true;
    data.reason = reason;

    this.db.set(id, data);

    return true;
  }

  public whitelist(id: string) {
    const data = this.db.ensure(id, {
      id: id,

      bonuses: 0,
      roles: [],

      counting: false,
      blacklisted: false,
      reason: null,

      history: [],
    });

    data.blacklisted = false;
    data.reason = null;

    this.db.set(id, data);

    return true;
  }

  public transfer(
    from: string,
    to: string,
    amount?: number
  ): { status: boolean; message?: string } {
    const from_data = this.db.ensure(from, {
      id: from,

      bonuses: 0,
      roles: [],

      counting: false,
      blacklisted: false,
      reason: null,

      history: [],
    });

    const to_data = this.db.ensure(to, {
      id: to,

      bonuses: 0,
      roles: [],

      counting: false,
      blacklisted: false,
      reason: null,

      history: [],
    });

    if (!amount) {
      to_data.bonuses += from_data.bonuses;
      from_data.bonuses = 0;

      this.db.set(from_data.id, from_data);
      this.db.set(to_data.id, to_data);

      return {
        status: true,
      };
    } else {
      if (from_data.bonuses < amount) {
        return {
          status: false,
          message:
            'Недостаточно бонусов, проверьте свой баланс через команду "!stats".',
        };
      }

      to_data.bonuses += amount;
      from_data.bonuses -= amount;

      this.db.set(from_data.id, from_data);
      this.db.set(to_data.id, to_data);

      return {
        status: true,
      };
    }
  }

  public data(id: string): BonusUser {
    const data = this.db.ensure(id, {
      id: id,

      bonuses: 0,
      roles: [],

      counting: false,
      blacklisted: false,
      reason: null,

      history: [],
    });

    return data;
  }

  public update(id: string, new_data: BonusUser): boolean {
    var data = this.db.ensure(id, {
      id: id,

      bonuses: 0,
      roles: [],

      counting: false,
      blacklisted: false,
      reason: null,

      history: [],
    });

    data = new_data;
    this.db.set(data.id, data);

    return true;
  }

  public add(id: string, amount: number): boolean {
    var data = this.db.ensure(id, {
      id: id,

      bonuses: 0,
      roles: [],

      counting: false,
      blacklisted: false,
      reason: null,

      history: [],
    });

    data.bonuses += amount;
    this.update(data.id, data);

    return true;
  }

  public subtract(id: string, amount: number): boolean {
    var data = this.db.ensure(id, {
      id: id,

      bonuses: 0,
      roles: [],

      counting: false,
      blacklisted: false,
      reason: null,

      history: [],
    });

    data.bonuses -= amount;
    this.db.set(data.id, data);

    return true;
  }

  public set(id: string, amount: number): boolean {
    var data = this.db.ensure(id, {
      id: id,

      bonuses: 0,
      roles: [],

      counting: false,
      blacklisted: false,
      reason: null,

      history: [],
    });

    data.bonuses = amount;
    this.db.set(data.id, data);

    return true;
  }

  public createHistoryItem(id: string, item: UserHistoryItem): boolean {
    var data = this.db.ensure(id, {
      id: id,

      bonuses: 0,
      roles: [],

      counting: false,
      blacklisted: false,
      reason: null,

      history: [],
    });

    item.id = data.history.length + 1;
    data.history.push(item);

    this.db.set(data.id, data);
    return true;
  }

  public async top(message: Message) {
    const out = [];

    const final = this.db.array();
    const data = final.sort((a, b) => b.bonuses - a.bonuses).slice(0, 49);

    for (let i = 0; i < data.length; i++) {
      const info = data[i];
      const member =
        (await (
          await message.guild.members.fetch({ force: true, user: info.id })
        ).user.toString()) || "Неизвестно#0000";

      const word = Functions.declOfNum(info.bonuses, [
        "бонус",
        "бонуса",
        "бонусов",
      ]);

      const index = i + 1;
      const bonuses = info.bonuses.toLocaleString("be");
      out.push(`**[${index}] ${member.toString()} — ${bonuses} ${word}**`);
    }

    const user_data = final.find((x) => x.id === message.author.id);
    const user_index = final.indexOf(user_data) + 1;
    const word = Functions.declOfNum(user_data.bonuses, [
      "бонус",
      "бонуса",
      "бонусов",
    ]);

    out.push("———————————————————");
    out.push(`**Вы на ${user_index} месте, у вас ${user_data.bonuses.toLocaleString("be")} ${word}**`); // prettier-ignore

    return out.join("\n");
  }

  private handle() {
    console.log(
      "[Bonus System] Creating Handler for Client#voiceStateUpdate Event..."
    );

    this.client.on("voiceStateUpdate", async (oldState, newState) => {
      if (oldState.member.user.bot || newState.member.user.bot) return;

      this.db.ensure(newState.member.id, {
        id: newState.member.id,

        bonuses: 0,
        roles: [],

        counting: false,
        blacklisted: false,
        reason: null,

        history: [],
      });

      if (!oldState.channel && newState.channel) {
        const members = newState.channel.members.filter((m) => {
          const data = this.db.fetch(m.user.id);
          return !m.user.bot || data.blacklisted === false;
        });

        if (members.size >= 2) {
          var _members = [];
          for (const [, member] of members) {
            const data = this.db.ensure(member.id, {
              id: member.id,

              bonuses: 0,
              roles: [],

              counting: false,
              blacklisted: false,
              reason: null,

              history: [],
            });

            if (data.counting === true) continue;

            _members.push(member.user.tag);
            await this.startCount(member.id, newState.channel);
          }

          if (_members.length) {
            console.log(
              `\n[Bonus System] Starting Count for ${_members.join(", ")}...\n`
            );

            _members = [];
          }
        }
      }
    });
  }
}
