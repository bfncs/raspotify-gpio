import express, { Application, Request } from "express";
import passport from "passport";
import { authRouter } from "./auth";
import config from "./config";
import setupGpio from "./gpio";
import { getSpotifyUser, setSpotifyAccessToken } from "./persistence";
import SpotifyClient, { refreshAccessToken } from "./SpotifyClient";

console.log("Starting raspotify-gpio…", config);

const spotify = new SpotifyClient(
  () => {
    return getSpotifyUser().accessToken;
  },
  async () => {
    const accessToken = await refreshAccessToken(getSpotifyUser().refreshToken);
    setSpotifyAccessToken(accessToken);
  }
);

const play = (spotifyUrl: string) => async (): Promise<void> => {
  console.log(`Playing ${spotifyUrl}`);

  const devices = await spotify.getDevices();
  const raspotifyDevice = devices.find(device =>
    device.name.startsWith("raspotify")
  );

  if (!raspotifyDevice) {
    throw new Error("no raspotify device found");
  }

  await spotify.play(raspotifyDevice, spotifyUrl);
};

const pause = () => async (): Promise<void> => {
  const devices = await spotify.getDevices();
  const raspotifyDevice = devices.find(device =>
    device.name.startsWith("raspotify")
  );

  if (!raspotifyDevice) {
    throw new Error("no raspotify device found");
  }

  await spotify.pause(raspotifyDevice);
};

const app: Application = express();
app.use(passport.initialize());
app.use("/auth", authRouter);

app.get("/", async (req: Request, res) => {
  try {
    const devices = await spotify.getDevices();
    res.send(`
<pre><code>
${JSON.stringify(getSpotifyUser(), null, 2)}
${JSON.stringify(devices, null, 2)}
</code></pre>
<form action="/play" method="post"><button type="submit">Play</button></form>
<form action="/pause" method="post"><button type="submit">Pause</button></form>
<form action="/auth/spotify/delete" method="post"><button type="submit">Log out</button></form>
`);
  } catch (e) {
    console.warn(e);
    res.send('<a href="/auth/spotify" />Login with spotify</a>');
    return;
  }
});

app.post("/play", async (req, res) => {
  try {
    await play("spotify:album:5ht7ItJgpBH7W6vJ5BqpPr")();
    res.redirect("/");
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

app.post("/pause", async (req, res) => {
  try {
    pause()();
    res.redirect("/");
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

(async () => {
  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}.`);
  });

  try {
    setupGpio(
      new Map([
        [11, play("spotify:album:5ht7ItJgpBH7W6vJ5BqpPr")],
        [12, pause()]
      ])
    );
  } catch (e) {
    console.error("Unable to init mopidy-buttons", e);
  }
})();
