import DataStore from "data-store";
import { SpotifyUser } from "./models";

const store = new DataStore({
  path: "/tmp/raspotify-gpio.json"
});

const keys = {
  SPOTIFY_USER: "SPOTIFY_USER"
};

export const setSpotifyUser = (user: SpotifyUser): void => {
  store.set(keys.SPOTIFY_USER, user);
};

export const getSpotifyUser = (): SpotifyUser | null => {
  return store.get(keys.SPOTIFY_USER) || null;
};

export const deleteSpotifyUser = (): void => {
  store.del(keys.SPOTIFY_USER);
};
