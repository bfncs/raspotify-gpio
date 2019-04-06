import setupGpio from "./gpio";
import MopidyClient from "./MopidyClient";
import { spotifyButtonMapHelpers } from "./utils/buttonMapHelpers";

(async () => {
  let mopidy: MopidyClient;
  try {
    mopidy = new MopidyClient({
      webSocketUrl: "ws://lil:6680/mopidy/ws/"
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
