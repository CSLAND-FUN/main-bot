import {
  Channel,
  Collection,
  GuildMember,
  Message,
  VoiceBasedChannel,
} from "discord.js";
import { cancelJob, Job, scheduleJob } from "node-schedule";

import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";
import Logger from "@src/classes/Logger";
import random from "random";

import Knex from "knex";
const knex = Knex({
  client: "mysql",
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATA,
  },
});

export interface BonusUser {
  id: string;
  group: number;

  bonuses: number;
  roles: string;

  counting: 0 | 1;
  blacklisted: 0 | 1;
  reason: string;

  bonus_used: string;
  newyear_used: string;
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
  public knex: typeof knex;

  public cache: Collection<string, string[]>;
  public jobs: Collection<string, Job>;
  public users: Collection<string, GuildMember[]>;

  constructor(client: DiscordBot) {
    this.client = client;
    this.knex = knex;

    this.cache = new Collection();
    this.jobs = new Collection();
    this.users = new Collection();

    this.tables();
    this.handle();

    //? Check Database Users every 5 minutes.
    scheduleJob("*/5 * * * *", async () => {
      const all = await this.all();
      const filtered = all.filter((u) => u.counting === 1);

      const guild = this.client.guilds.cache.get(process.env.SERVER_ID);
      for (const user of filtered) {
        var member: GuildMember;
        try {
          member = await guild.members.fetch(user.id);
        } catch (error) {
          await this.update(user.id, "counting", 0);

          const job = this.jobs.get(user.id);
          if (job) {
            cancelJob(job);
            this.jobs.delete(user.id);
          }

          return;
        }

        const data = await this.data(user.id);
        if (!member.voice.channel && data.counting === 1) {
          await this.update(user.id, "counting", 0);

          const job = this.jobs.get(user.id);
          if (job) {
            cancelJob(job);
            this.jobs.delete(user.id);
          }

          return;
        } else if (
          member.voice.channel &&
          member.voice.channel.members.size < 2 &&
          data.counting === 1
        ) {
          await this.update(user.id, "counting", 0);

          const job = this.jobs.get(user.id);
          if (job) {
            cancelJob(job);
            this.jobs.delete(user.id);
          }

          return;
        }
      }
    });

    //? Check Jobs every minute.
    scheduleJob("*/1 * * * *", async () => {
      const _all = this.jobs.keys();
      const guild = this.client.guilds.cache.get(process.env.SERVER_ID);

      for (const user of _all) {
        var member: GuildMember;
        try {
          member = await guild.members.fetch(user);
        } catch (error) {
          await this.update(user, "counting", 0);

          const job = this.jobs.get(user);
          if (job) {
            cancelJob(job);
            this.jobs.delete(user);
          }

          return;
        }

        const data = await this.data(user);
        if (!member.voice.channel && data.counting === 1) {
          await this.update(user, "counting", 0);

          const job = this.jobs.get(user);
          if (job) {
            cancelJob(job);
            this.jobs.delete(user);
          }

          return;
        }
      }
    });
  }

  async startCount(id: string, channel: VoiceBasedChannel) {
    await this.data(id);
    await this.update(id, "counting", 1);

    const job: Job = scheduleJob("*/5 * * * *", async () => {
      var member: GuildMember;
      try {
        member = await channel.guild.members.fetch(id);
      } catch (error) {
        await this.update(id, "counting", 0);

        cancelJob(job);
        this.jobs.has(id) && this.jobs.delete(id);

        return;
      }

      const data = await this.data(member.id);
      if (data.counting === 0) {
        cancelJob(job);
        this.jobs.has(id) && this.jobs.delete(id);

        return;
      }

      if (!member.voice.channel && data.counting === 1) {
        await this.update(member.id, "counting", 0);

        cancelJob(job);
        this.jobs.has(id) && this.jobs.delete(id);

        return;
      }

      await this.update(id, "bonuses", data.bonuses + random.int(2, 7));
    });

    if (!this.jobs.has(id)) this.jobs.set(id, job);
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
          group: 1,

          bonuses: 0,
          roles: "",

          counting: 0,
          blacklisted: 0,
          reason: null,

          bonus_used: null,
          newyear_used: null,
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

  async createHistoryItem(item: UserHistoryItem): Promise<boolean> {
    await this.knex<UserHistoryItem>("bonus_users_history").insert({
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
    Logger.log("Creating Handler for Client#voiceStateUpdate Event", "Bonuses");
    this.client.on("voiceStateUpdate", async (oldState, newState) => {
      if (oldState.member.user.bot || newState.member.user.bot) return;
      if (
        oldState.guild.id !== process.env.SERVER_ID ||
        newState.guild.id !== process.env.SERVER_ID
      ) {
        return;
      }

      //? Создаём строку в базе если пользователя не существует в ней.
      await this.data(newState.member.id);

      //? Если пользователь зашёл в канал.
      if (!oldState.channel && newState.channel) {
        const members = newState.channel.members.filter(async (m) => {
          const data = await this.data(m.id);
          return !m.user.bot || data.blacklisted !== 1;
        });

        //? Если число больше или равно двум.
        if (members.size >= 2) {
          for (const [, member] of members) {
            const data = await this.data(member.id);
            if (data.counting === 1) continue;

            const job = this.jobs.has(member.id);
            if (job) continue;

            await this.startCount(member.id, newState.channel);
            Logger.log(`Started job for ${member.user.tag}`, "Bonuses");

            const users = this.users.get(newState.channel.id);
            if (!users) {
              this.users.set(newState.channel.id, []);

              //? Пополняем список пользователей.
              const new_users = this.users.get(newState.channel.id);
              new_users.push(member);
              this.users.set(newState.channel.id, new_users);
            } else if (users && !users.find((x) => x.id === member.id)) {
              //? Пополняем список пользователей.
              const users = this.users.get(newState.channel.id);
              users.push(member);
              this.users.set(newState.channel.id, users);
            }
          }
        }
      }
      //? Если пользователь вышел с канала.
      else if (oldState.channel && !newState.channel) {
        var old_members: Collection<string, GuildMember>;

        try {
          old_members = oldState.channel.members.filter(async (m) => {
            const data = await this.data(m.id);
            return !m.user.bot || data.blacklisted !== 1;
          });
        } catch (e) {
          old_members = new Collection();

          const users = this.users.get(oldState.channel.id);
          if (users.length) {
            //? Пополняем коллекцию прошлых пользователей.
            for (const user of users) {
              old_members.set(user.id, user);
            }
          }
        }

        var channel: Channel;

        try {
          channel = await newState.guild.channels.cache.get(
            oldState.channel.id
          );
        } catch (e) {
          for (const [, member] of old_members) {
            const data = await this.data(member.id);
            if (data.counting !== 1) continue;

            const job = this.jobs.get(member.id);
            if (!job) continue;

            await this.update(member.id, "counting", 0);
            cancelJob(job);

            this.users.delete(oldState.channel.id);
          }

          return;
        }

        if (!channel.isVoiceBased()) return;

        const members = channel.members.filter(async (m) => {
          const data = await this.data(m.id);
          return !m.user.bot || data.blacklisted !== 1;
        });

        //? Проверяем количество участников в ГС.
        //? Если меньше двух, то заканчиваем работу участников.
        if (old_members.size >= 2 && members.size < 2) {
          for (const [, member] of members) {
            const data = await this.data(member.id);
            if (data.counting !== 1) continue;

            const job = this.jobs.get(member.id);
            if (!job) continue;

            await this.update(member.id, "counting", 0);
            cancelJob(job);
          }

          for (const [, member] of old_members) {
            const data = await this.data(member.id);
            if (data.counting !== 1) continue;

            const job = this.jobs.get(member.id);
            if (!job) continue;

            await this.update(member.id, "counting", 0);
            cancelJob(job);
          }

          this.users.delete(channel.id);
          return;
        }
      }
    });
  }

  private async tables() {
    var bonuses_table = "bonus_users";
    const bonuses_table_check = await this.knex.schema.hasTable(bonuses_table);
    if (!bonuses_table_check) {
      await this.knex.schema.createTable("bonus_users", (table) => {
        table.string("id", 50).notNullable();
        table.integer("group", 1).notNullable().defaultTo(1);

        table.integer("bonuses", 255).notNullable().defaultTo(0);
        table.string("roles", 3).notNullable().defaultTo("");

        table.boolean("counting").defaultTo(false);
        table.boolean("blacklisted").defaultTo(false);
        table.string("reason", 255).nullable();

        table.string("bonus_used", 255).nullable();
        table.string("newyear_used", 255).nullable();

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

  async checker() {
    const guild = this.client.guilds.cache.get(process.env.SERVER_ID);
    if (!guild) return;

    const data = await this.knex<BonusUser>("bonus_users")
      .select()
      .where({
        counting: 1,
      })
      .finally();

    for (const user of data) {
      const member = guild.members.cache.get(user.id);
      if (!member) continue;

      const data = await this.data(user.id);
      if (data.counting !== 1) continue;

      await this.update(user.id, "counting", 0);
      Logger.log(
        `Stopped counting for ${user.id} due to bot restart.`,
        "Bonuses"
      );
    }
  }
}
