export {};

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      BOT_TOKEN: string;
      OWNERS: string;

      LOBBYS_CATEGORY_ID: string;
      LOBBYS_CHANNEL_ID: string;

      WELCOME_CHANNEL_ID: string;
      STATUS_CHANNEL_ID: string;
      TEST_CHANNEL_ID: string;
      COMMANDS_CHANNEL_ID: string;
      SETTINGS_CHANNEL_ID: string;
      NEWS_CHANNEL_ID: string;
      NOTIFICATIONS_CHANNEL_ID: string;

      AUTOROLE_ID: string;
      SERVER_ID: string;

      API_BASE_URL: string;
      API_SECRET_TOKEN: string;

      MYSQL_HOST: string;
      MYSQL_USER: string;
      MYSQL_PASS: string;
      MYSQL_DATA: string;
    }
  }
}
