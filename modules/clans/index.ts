import { Knex, knex } from "knex";
import { v4 as uuid } from "uuid";
import DiscordBot from "@src/classes/Discord";

export interface Clan {
  id: string;

  name: string;
  description: string;
  tag: string;

  type: 0 | 1; //? 0 - Closed | 1 - Opened for everyone

  owner: string;
  members: number;
  createdAt: Date;
}

export interface ClanMember {
  clanID: string;
  id: string;
  joinedAt: Date;
}

export class ClanSystem {
  public client: DiscordBot;
  public sql: Knex;

  constructor(client: DiscordBot) {
    this.client = client;
    this.sql = knex({
      client: "mysql",
      connection: {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DATA,
      },
    });

    this.tables();
  }

  async getClans() {
    const clans = await this.sql<Clan>("clans").select().finally();
    return clans;
  }

  async createClan(
    member: string,
    name: string,
    description: string,
    tag: string,
    type: number
  ) {
    const clans = await this.sql<Clan>("clans").select().finally();
    const member_clan = await this.sql<ClanMember>("clans_members")
      .select()
      .where({
        id: member,
      })
      .finally();

    if (clans.find((x) => x.owner === member) || member_clan.length) {
      return {
        status: false,
        message: "Вы уже состоите в клане!",
      };
    }

    const id = uuid().slice(0, 8);
    await this.sql<Clan>("clans").insert({
      id: id,

      name: name,
      description: description,
      tag: tag,

      type: type as 0 | 1,

      owner: member,
      members: 1,
      createdAt: new Date(),
    });

    await this.sql<ClanMember>("clans_members").insert({
      clanID: id,
      id: member,
      joinedAt: new Date(),
    });

    return {
      status: true,
      message: "Клан успешно создан!",
    };
  }

  async joinClan(id: string, member: string) {
    const clans = await this.sql<Clan>("clans")
      .select()
      .where({
        id: id,
      })
      .finally();

    if (!clans.length) {
      return {
        status: false,
        message: "Клан не найден!",
      };
    }

    const member_clan = await this.sql<ClanMember>("clans_members")
      .select()
      .where({
        id: member,
      })
      .finally();

    if (member_clan.length) {
      return {
        status: false,
        message: "Вы уже состоите в клане!",
      };
    }

    await this.sql<ClanMember>("clans_members").insert({
      clanID: clans[0].id,
      id: member,
      joinedAt: new Date(),
    });

    await this.sql<Clan>("clans")
      .update({
        members: clans[0].members + 1,
      })
      .where({
        id: clans[0].id,
      });

    return {
      status: true,
      message: "Вы успешно вошли в клан!",
    };
  }

  async leaveClan(member: string) {
    const _clan = await this.sql<ClanMember>("clans_members")
      .select()
      .where({
        id: member,
      })
      .finally();

    if (!_clan.length) {
      return {
        status: false,
        message: "Вы не состоите в клане!",
      };
    }

    await this.sql<ClanMember>("clans_members").delete().where({
      clanID: _clan[0].clanID,
      id: member,
    });

    const clan = await this.sql<Clan>("clans")
      .select()
      .where({
        id: _clan[0].clanID,
      })
      .finally();

    await this.sql<Clan>("clans")
      .update({
        members: clan[0].members - 1,
      })
      .where({
        id: _clan[0].clanID,
      });

    return {
      status: true,
      message: "Вы успешно вышли из клана!",
    };
  }

  async isInClan(member: string) {
    const clans = await this.sql<Clan>("clans")
      .select()
      .where({
        owner: member,
      })
      .finally();

    const member_clan = await this.sql<ClanMember>("clans_members")
      .select()
      .where({
        id: member,
      })
      .finally();

    if (clans.length || member_clan.length) return true;
    else return false;
  }

  async getUserClan(member: string) {
    const clan_member = await this.sql<ClanMember>("clans_members")
      .select()
      .where({
        id: member,
      })
      .finally();

    const clans = await this.sql<Clan>("clans")
      .select()
      .where({
        id: clan_member[0].clanID,
      })
      .finally();

    if (clans.length) return clans[0];
    else return null;
  }

  private async tables() {
    const clans_table_name = "clans";
    await this.sql.schema.createTableIfNotExists(clans_table_name, (table) => {
      table.string("id", 255).notNullable();

      table.string("name", 50).notNullable();
      table.string("description", 150).notNullable().defaultTo("Без описания");
      table.string("tag", 15).notNullable().defaultTo("-");

      table.integer("type", 1).notNullable().defaultTo(1);

      table.string("owner").notNullable();
      table.integer("members").notNullable().defaultTo(1);
      table.date("createdAt").notNullable();

      return table;
    });

    const members_table_name = "clans_members";
    await this.sql.schema.createTableIfNotExists(
      members_table_name,
      (table) => {
        table.string("clanID", 255).notNullable();
        table.string("id", 255).notNullable();
        table.date("joinedAt").notNullable();

        return table;
      }
    );
  }
}
