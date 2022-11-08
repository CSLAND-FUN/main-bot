import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";
import { Channel, Collection, Message, VoiceBasedChannel } from "discord.js";
import Enmap from "enmap";

import { cancelJob, Job, scheduleJob } from "node-schedule";
import random from "random";

import Knex from "knex";
import config from "../../src/config.json";
const knex = Knex({
  client: "mysql",
  connection: {
    host: config.DATABASE.HOST,
    user: config.DATABASE.USER,
    password: config.DATABASE.PASS,
    database: config.DATABASE.DATABASE,
  },
});

export interface BonusUser {
  id: string;

  bonuses: number;
  roles: string;

  counting: 0 | 1;
  blacklisted: 0 | 1;
  reason: string;
}

export interface UserHistoryItem {
  id?: number;

  user_id: string;
  type: "BONUS" | "PRIVILEGE";
  message: string;

  cost: number;
  time: string;
}

export enum HistoryType {
  BONUS = "BONUS",
  PRIVILEGE = "PRIVILEGE",
}

export class BonusSystem {
  public client: DiscordBot;
  public db: Enmap<string, BonusUser>;
  public knex: typeof knex;
  public cache: Collection<string, string[]>;

  constructor(client: DiscordBot) {
    this.client = client;
    this.db = new Enmap({
      dataDir: "./database",
      name: "bonus-system",
      wal: false,
    });
    this.knex = knex;
    this.cache = new Collection();

    this.handle_database();
    this.handle();
  }

  async startCount(id: string, channel: VoiceBasedChannel) {
    await this.data(id);
    await this.update(id, "counting", 1);

    const job: Job = scheduleJob("*/5 * * * *", async () => {
      var newChannel: Channel;
      try {
        newChannel = await this.client.channels.fetch(channel.id);
      } catch (error) {
        const cached = this.cache.get(channel.id);
        if (!cached) return cancelJob(job);

        for (const cached_id of cached) {
          const data = await this.data(cached_id);
          if (data.counting) await this.update(cached_id, "counting", 0);

          console.log(
            `[Bonus System] Canceled job for ${cached_id} due to channel is deleted.`
          );
        }

        return cancelJob(job);
      }

      if (!newChannel.isVoiceBased()) return cancelJob(job);

      const newData = await this.data(id);
      const members = newChannel.members.filter(async (m) => {
        const data = await this.data(m.id);
        return !m.user.bot || data.blacklisted !== 1;
      });

      if (members.size < 2) {
        const _members = [];
        if (newData.counting === 1) {
          await this.update(newData.id, "counting", 0);
        }

        _members.push(newData.id);
        console.log(
          `[Bonus System] Stopped counting for ${_members.join(", ")}.`
        );

        return cancelJob(job);
      }

      const users = await this.all();
      for (const u of users) {
        if (u.counting === 0) continue;

        const member = newChannel.guild.members.cache.get(u.id);
        if (!member.voice.channel) {
          await this.update(u.id, "counting", 0);
        }
      }

      const _new_data = await this.data(newData.id);
      if (_new_data.counting === 1) {
        await this.update(
          newData.id,
          "bonuses",
          newData.bonuses + random.int(2, 7)
        );
      }
    });

    return true;
  }

  async blacklist(id: string, reason = "Нарушение правил") {
    await this.data(id);
    await this.update(id, "blacklisted", 1);
    await this.update(id, "reason", reason);

    return true;
  }

  async whitelist(id: string) {
    await this.data(id);
    await this.update(id, "blacklisted", 0);
    await this.update(id, "reason", null);

    return true;
  }

  async transfer(
    from: string,
    to: string,
    amount?: number
  ): Promise<{ status: boolean; message?: string }> {
    const from_data = await this.data(from);
    const to_data = await this.data(to);

    if (!amount) {
      await this.update(
        to_data.id,
        "bonuses",
        to_data.bonuses + from_data.bonuses
      );

      await this.update(from_data.id, "bonuses", 0);

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

      await this.update(to_data.id, "bonuses", to_data.bonuses + amount);
      await this.update(from_data.id, "bonuses", from_data.bonuses - amount);

      return {
        status: true,
      };
    }
  }

  async all(): Promise<BonusUser[]> {
    const data = await this.knex<BonusUser>("bonus_users").select().finally();
    return data;
  }

  async data(id: string): Promise<BonusUser> {
    var _data = await this.knex<BonusUser>("bonus_users")
      .select()
      .where({ id: id })
      .finally();

    if (!_data.length) {
      await this.knex<BonusUser>("bonus_users")
        .insert({
          id: id,

          bonuses: 0,
          roles: null,

          counting: 0,
          blacklisted: 0,
          reason: null,
        })
        .finally();

      _data = await this.knex<BonusUser>("bonus_users")
        .select()
        .where({ id: id })
        .finally();
    }

    const data = _data[0];
    return data;
  }

  async update<K extends keyof BonusUser, V extends BonusUser[K]>(
    id: string,
    key: K,
    value: V
  ): Promise<boolean> {
    await this.data(id);
    await this.knex<BonusUser>("bonus_users")
      .update({
        [key]: value,
      })
      .where({ id: id });

    return true;
  }

  async add(id: string, amount: number): Promise<boolean> {
    const data = await this.data(id);
    await this.update(id, "bonuses", data.bonuses + amount);

    return true;
  }

  async subtract(id: string, amount: number): Promise<boolean> {
    const data = await this.data(id);
    await this.update(id, "bonuses", data.bonuses - amount);

    return true;
  }

  async set(id: string, amount: number): Promise<boolean> {
    await this.data(id);
    await this.update(id, "bonuses", amount);

    return true;
  }

  async createHistoryItem(id: string, item: UserHistoryItem): Promise<boolean> {
    const all = await await this.knex<UserHistoryItem>("bonus_users_history")
      .select()
      .finally();

    await this.knex<UserHistoryItem>("bonus_users_history").insert({
      id: all.length + 1,
      ...item,
    });

    return true;
  }

  async top(message: Message) {
    const out = [];

    const final = await this.all();
    const data = final.sort((a, b) => b.bonuses - a.bonuses).slice(0, 50);

    await message.guild.members.fetch();
    for (let i = 0; i < data.length; i++) {
      const info = data[i];

      var tag = "";
      var member = message.guild.members.cache.get(info.id);
      if (!member) {
        tag = "Неизвестно#0000";
      } else tag = member.user.toString();

      const word = Functions.declOfNum(info.bonuses, [
        "бонус",
        "бонуса",
        "бонусов",
      ]);

      const index = i + 1;
      const bonuses = info.bonuses.toLocaleString("be");
      out.push(`**[${index}] ${tag} — ${bonuses} ${word}**`);
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
      await this.data(newState.member.id);

      if (!oldState.channel && newState.channel) {
        const members = newState.channel.members.filter(async (m) => {
          const data = await this.data(m.id);
          return !m.user.bot || data.blacklisted !== 1;
        });

        if (members.size >= 2) {
          var _members = [];
          var ids = [];

          for (const [, member] of members) {
            const data = await this.data(member.id);
            if (data.counting === 1) continue;

            _members.push(member.user.tag);
            ids.push(member.id);

            await this.startCount(member.id, newState.channel);
          }

          if (ids.length) {
            this.cache.set(newState.channel.id, ids);
            ids = [];
          }

          if (_members.length) {
            console.log(
              `[Bonus System] Starting Count for ${_members.join(", ")}...`
            );

            _members = [];
          }
        }
      }
    });
  }

  private async handle_database() {
    var bonuses_table = "bonus_users";
    const bonuses_table_check = await this.knex.schema.hasTable(bonuses_table);
    if (!bonuses_table_check) {
      await this.knex.schema.createTable("bonus_users", (table) => {
        table.string("id", 50).notNullable();

        table.integer("bonuses", 255).defaultTo(0);
        table.string("roles", 3).nullable();

        table.boolean("counting").defaultTo(false);
        table.boolean("blacklisted").defaultTo(false);
        table.string("reason", 255).nullable();

        return table;
      });
    }

    var history_table = "bonus_users_history";
    const history_table_check = await this.knex.schema.hasTable(history_table);
    if (!history_table_check) {
      await this.knex.schema.createTable("bonus_users_history", (table) => {
        table.increments("id").primary();

        table.string("user_id", 50).notNullable();
        table.string("type", 10).notNullable();
        table.string("message", 255).notNullable();

        table.integer("cost", 255).notNullable();
        table.string("time", 255).notNullable();

        return table;
      });
    }
  }
}
