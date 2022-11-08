import { BonusUser, HistoryType, UserHistoryItem } from "@modules/bonuses";
import cfg, { DATABASE } from "../config.json";

import Enmap from "enmap";
import Knex from "knex";

import { ActivityType, Client } from "discord.js";
const client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildPresences"],
});

const database: Enmap<
  string,
  {
    id: string;
    bonuses: number;
    roles: number[];
    counting: boolean;
    blacklisted: boolean;
    reason: string;

    history: {
      id?: number;
      type: HistoryType;

      message: string;

      cost: number;
      date: number;
    }[];
  }
> = new Enmap({
  name: "bonus_system",
  dataDir: __dirname,
  wal: false,
});

const sql = Knex({
  client: "mysql",
  connection: {
    host: DATABASE.HOST,
    user: DATABASE.USER,
    password: DATABASE.PASS,
    database: DATABASE.DATABASE,
  },
});

client.login(cfg.TOKEN);

client.on("ready", async () => {
  client.user.setActivity({
    name: "Миграция...",
    type: ActivityType.Watching,
  });

  console.log("[Client] Мигрирую пользователей...");
  await createTablesIfNotExists();

  const guild = client.guilds.cache.get("936334108240543785");
  await guild.members.fetch();

  for (const [key, value] of database.entries()) {
    const member = guild.members.cache.get(key);
    if (!member || member.user.bot) {
      console.log(`[Migration] Пропускаю ${key}...`);
      continue;
    }

    var roles: string | null;
    if (value.roles && value.roles.length) {
      roles = "";
      for (const role of value.roles) {
        roles += role.toString();
      }
    } else roles = null;

    sql<BonusUser>("bonus_users")
      .insert({
        id: member.id,

        bonuses: value.bonuses,
        roles: roles,

        counting: 0,
        blacklisted: value.blacklisted === true ? 1 : 0,
        reason: value.reason,
      })
      .finally();

    console.log(`[Migration] Мигрировал данные пользователя ${key}`);

    if (value.history && value.history.length) {
      for (const item of value.history) {
        sql<UserHistoryItem>("bonus_users_history")
          .insert({
            type: item.type,
            user_id: member.id,
            message: item.message,

            cost: item.cost,
            time: item.date.toString(),
          })
          .finally();
      }

      console.log(`[Migration] Мигрировал историю покупок пользователя ${key}`);
    }
  }

  console.log("\n[Migration] Миграция окончена!");
  // process.exit();
});

async function createTablesIfNotExists() {
  var bonuses_table = "bonus_users";
  const bonuses_table_check = await sql.schema.hasTable(bonuses_table);
  if (!bonuses_table_check) {
    await sql.schema.createTable("bonus_users", (table) => {
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
  const history_table_check = await sql.schema.hasTable(history_table);
  if (!history_table_check) {
    await sql.schema.createTable("bonus_users_history", (table) => {
      table.increments("id");

      table.string("user_id", 50).notNullable();
      table.string("type", 10).notNullable();
      table.string("message", 255).notNullable();

      table.integer("cost", 255).notNullable();
      table.string("time", 255).notNullable();

      return table;
    });
  }
}
