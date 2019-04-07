import { SpotifyDevice } from "./models/spotify";
import axios from "axios";

export default class SpotifyClient {
  public async getDevices(accessToken: string): Promise<SpotifyDevice[]> {
    const res = await axios.get<{ devices: SpotifyDevice[] }>(
      "https://api.spotify.com/v1/me/player/devices",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return res.data.devices;
  }

  public async play(accessToken: string, device: SpotifyDevice): Promise<void> {
    const res = await axios.put(
      "https://api.spotify.com/v1/me/player/play",
      { context_uri: "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr" },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          device_id: device.id
        }
      }
    );
    console.log(res);
  }

  public async pause(
    accessToken: string,
    device: SpotifyDevice
  ): Promise<void> {
    console.log("pause", { accessToken, device });
    const res = await axios.put(
      "https://api.spotify.com/v1/me/player/pause",
      null,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          device_id: device.id
        }
      }
    );
    console.log(res);
  }
}
