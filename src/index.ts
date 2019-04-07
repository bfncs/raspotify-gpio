import express, { Application, Request } from "express";
import passport from "passport";
import setupGpio from "./gpio";
import { getSpotifyUser } from "./persistence";
import SpotifyClient from "./SpotifyClient";
import config from "./config";
import { authRouter } from "./auth";

console.log("Starting raspotify-gpio…", config);

const spotify = new SpotifyClient();

const app: Application = express();
app.use(passport.initialize());
app.use("/auth", authRouter);

app.get("/", async (req: Request, res) => {
  const user = getSpotifyUser();
  if (!user) {
    res.send('<a href="/auth/spotify" />Login with spotify</a>');
    return;
  }

  try {
    const devices = await spotify.getDevices(user.accessToken);
    res.send(`
<pre><code>
${JSON.stringify(user, null, 2)}
${JSON.stringify(devices, null, 2)}
</code></pre>
<form action="/play" method="post"><button type="submit">Play</button></form>
<form action="/pause" method="post"><button type="submit">Pause</button></form>
<form action="/auth/spotify/delete" method="post"><button type="submit">Log out</button></form>
`);
  } catch (e) {
    console.error(e);
  }
});

app.post("/play", async (req, res) => {
  const user = getSpotifyUser();
  if (!user) {
    res.status(500).send("not logged in");
    return;
  }

  try {
    const devices = await spotify.getDevices(user.accessToken);
    const raspotifyDevice = devices.find(device =>
      device.name.startsWith("raspotify")
    );

    if (!raspotifyDevice) {
      res.status(500).send("no raspotify device found");
      return;
    }

    await spotify.play(user.accessToken, raspotifyDevice);

    res.redirect("/");
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

app.post("/pause", async (req, res) => {
  const user = getSpotifyUser();
  if (!user) {
    res.status(500).send("not logged in");
    return;
  }

  try {
    const devices = await spotify.getDevices(user.accessToken);
    const raspotifyDevice = devices.find(device =>
      device.name.startsWith("raspotify")
    );

    if (!raspotifyDevice) {
      res.status(500).send("no raspotify device found");
      return;
    }

    await spotify.pause(user.accessToken, raspotifyDevice);
    res.redirect("/");
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err: any = new Error("Not Found");
  err.status = 404;
  next(err);
});

(async () => {
  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}.`);
  });

  try {
    setupGpio(
      new Map([
        [
          11,
          () => {
            console.log("11 pressed");
          }
        ]
      ])
    );
  } catch (e) {
    console.error("Unable to init mopidy-buttons", e);
  }
})();
