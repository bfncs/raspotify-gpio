/*
Playing a spotify playlist in web ui
{"method":"core.tracklist.clear","params":{},"jsonrpc":"2.0","id":329}
{"method":"core.tracklist.add","params":{"uri":"spotify:track:49MWSiZnKcHA3AVDfahSJv","at_position":0},"jsonrpc":"2.0","id":100}
{"method":"core.tracklist.set_random","params":[true],"jsonrpc":"2.0","id":421}
{"method":"core.playback.play","params":{"tlid":27},"jsonrpc":"2.0","id":101}
 */

import Mopidy from "mopidy";

export default class MopidyClient {
  private mopidy: Mopidy;
  constructor({ webSocketUrl }: { webSocketUrl: string }) {
    this.mopidy = new Mopidy({
      webSocketUrl
    });
  }
  public init(): Promise<void> {
    return new Promise(resolve => {
      this.mopidy.on("state:online", resolve);
    });
  }
  public async playSpotifyPlaylist(
    uri: string,
    random: boolean = true
  ): Promise<void> {
    // TODO: fetch playlist and add all tracks
    await this.mopidy.tracklist.clear();
    await this.mopidy.tracklist.add({
      at_position: 0,
      uri
    });
    await this.mopidy.tracklist.setRandom({ value: random });
    await this.mopidy.playback.play({ tlid: 1 });
  }
}
