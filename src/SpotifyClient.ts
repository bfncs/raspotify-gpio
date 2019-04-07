import axios, { AxiosError, AxiosInstance } from "axios";
import qs from "qs";
import config from "./config";
import { SpotifyDevice } from "./models/spotify";

const isAxiosError = (error: any): error is AxiosError => {
  return "config" in error;
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<string> => {
  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    qs.stringify({ grant_type: "refresh_token", refresh_token: refreshToken }),
    {
      auth: {
        username: config.spotify.clientID,
        password: config.spotify.clientSecret
      }
    }
  );
  return res.data.access_token;
};

export default class SpotifyClient {
  private getAccessToken: () => string;
  private updateAccessToken: () => Promise<void>;

  constructor(
    getAccessToken: () => string,
    updateAccessToken: () => Promise<void>
  ) {
    this.getAccessToken = getAccessToken;
    this.updateAccessToken = updateAccessToken;
  }

  public async getDevices(): Promise<SpotifyDevice[]> {
    const res = await this.handleUnauthorized(() =>
      this.axios().get<{ devices: SpotifyDevice[] }>("me/player/devices")
    );
    return res.data.devices;
  }

  public async play(device: SpotifyDevice, spotifyUri?: string): Promise<void> {
    console.log("play", { spotifyUri, device });
    const res = await this.handleUnauthorized(() =>
      this.axios().put(
        "me/player/play",
        spotifyUri ? { context_uri: spotifyUri } : null,
        {
          params: {
            device_id: device.id
          }
        }
      )
    );
    console.log(res);
  }

  public async pause(device: SpotifyDevice): Promise<void> {
    console.log("pause", { device });
    const res = await this.handleUnauthorized(() =>
      this.axios().put("me/player/pause", null, {
        params: {
          device_id: device.id
        }
      })
    );
    console.log(res);
  }

  private axios(): AxiosInstance {
    return axios.create({
      baseURL: "https://api.spotify.com/v1/",
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`
      }
    });
  }

  private async handleUnauthorized<R>(fn: () => Promise<R>): Promise<R> {
    try {
      return fn();
    } catch (error) {
      if (
        !(
          isAxiosError(error) &&
          error.response &&
          error.response.status !== 401
        )
      ) {
        throw error;
      }

      console.log(
        "Got unauthorized response, updating access token and retrying once"
      );
      await this.updateAccessToken();
      return fn();
    }
  }
}
