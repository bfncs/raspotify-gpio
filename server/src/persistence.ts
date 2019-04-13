import DataStore from "data-store";
import { SpotifyUser } from "./models";

const store = new DataStore({
  path: "/tmp/raspotify-gpio.json"
});

const keys = {
  SPOTIFY_USER: "SPOTIFY_USER"
};

export const getSpotifyUser = (): SpotifyUser => {
  const user = store.get(keys.SPOTIFY_USER);
  if (!user) {
    throw new Error("Unable to get user");
  }
  return user;
};

export const setSpotifyUser = (user: SpotifyUser): void => {
  store.set(keys.SPOTIFY_USER, user);
};

export const setSpotifyAccessToken = (accessToken: string): void => {
  store.set(`${keys.SPOTIFY_USER}.accessToken`, accessToken);
};

export const deleteSpotifyUser = (): void => {
  store.del(keys.SPOTIFY_USER);
};
