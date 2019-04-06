import setupGpio from "./gpio";
import MopidyClient from "./MopidyClient";
import { spotifyButtonMapHelpers } from "./utils/buttonMapHelpers";

const { WEBSOCKET_URL: webSocketUrl = "ws://localhost:6680/mopidy/ws/" } = process.env;

console.log("Starting mopidy-buttons…", { webSocketUrl });

(async () => {
  let mopidy: MopidyClient;
  try {
    mopidy = new MopidyClient({
      webSocketUrl
    });
    await mopidy.init();
    // await mopidy.playSpotifyPlaylist("spotify:track:49MWSiZnKcHA3AVDfahSJv");

    const spotify = spotifyButtonMapHelpers(mopidy);

    setupGpio(
      new Map([[11, spotify.playlist("spotify:track:49MWSiZnKcHA3AVDfahSJv")]])
    );
  } catch (e) {
    console.error("Unable to init mopidy-buttons", e);
  }
})();
