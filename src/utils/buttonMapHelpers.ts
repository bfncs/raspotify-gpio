import MopidyClient from "../MopidyClient";

export const spotifyButtonMapHelpers = (mopidy: MopidyClient) => ({
  playlist: (uri: string) => () => {
    try {
      mopidy.playSpotifyPlaylist(uri);
    } catch (e) {
      console.warn("Unable to play spotify playlist", e);
    }
  }
});
