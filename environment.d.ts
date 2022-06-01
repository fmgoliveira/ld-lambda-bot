declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';

      BOT_TOKEN: string;
      BOT_VERSION: string;

      MONGODB_URL: string;

      DEV_GUILD: string;
      MAIN_GUILD: string;
      BOT_ADMIN: string;
      BOT_DEV: string;
      BUGS_CHANNEL: string;
      STAFF: string;
      VOTED: string;

      BOT_WEBHOOK_URL: string;
      ERRORS_WEBHOOK_URL: string;

      BRAINSHOP_BID: string;
      BRAINSHOP_KEY: string;

      PORT: string;
    }
  }
}

export { };