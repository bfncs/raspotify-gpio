interface Config {
  port: number;
  spotify: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
}

const { PORT, CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } = process.env;

const config: Config = {
  port: parseInt(`${PORT}`, 10) || 8080,
  spotify: {
    clientID: CLIENT_ID || "",
    clientSecret: CLIENT_SECRET || "",
    callbackURL: CALLBACK_URL || ""
  }
};

export default config;
