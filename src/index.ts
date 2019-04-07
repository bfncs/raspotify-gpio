import axios from "axios";
import express, { Application, Request, Response } from "express";
import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import setupGpio from "./gpio";
import { SpotifyDevice, SpotifyUser } from "./models";
import {
  deleteSpotifyUser,
  getSpotifyUser,
  setSpotifyUser
} from "./persistence";

console.log("Starting raspotify-gpio…");

const { PORT = 8080, CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } = process.env;

const getDevices = async (accessToken: string): Promise<SpotifyDevice[]> => {
  const res = await axios.get<{ devices: SpotifyDevice[] }>(
    "https://api.spotify.com/v1/me/player/devices",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  return res.data.devices;
};

const play = async (
  accessToken: string,
  device: SpotifyDevice
): Promise<void> => {
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
};

const pause = async (
  accessToken: string,
  device: SpotifyDevice
): Promise<void> => {
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
};

passport.use(
  new SpotifyStrategy(
    {
      clientID: String(CLIENT_ID),
      clientSecret: String(CLIENT_SECRET),
      callbackURL: String(CALLBACK_URL)
    },
    (accessToken, refreshToken, expiresIn, profile, done) => {
      console.log("verify", { accessToken, refreshToken, expiresIn, profile });
      const { id } = profile;
      const user: SpotifyUser = {
        id,
        accessToken,
        refreshToken
      };
      setSpotifyUser(user);
      done(null, user);
    }
  )
);

const app: Application = express();
app.use(passport.initialize());

app.get("/", async (req: Request, res) => {
  const user = getSpotifyUser();
  if (!user) {
    res.send('<a href="/auth/spotify" />Login with spotify</a>');
    return;
  }

  try {
    const devices = await getDevices(user.accessToken);
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

app.get(
  "/auth/spotify",
  passport.authenticate("spotify", {
    scope: ["user-read-playback-state", "user-modify-playback-state"]
  })
);

app.get(
  "/auth/spotify/callback",
  passport.authenticate("spotify", { failureFlash: true, session: false }),
  (_, res: Response) => {
    res.redirect("/");
  }
);

app.post("/auth/spotify/delete", (_, res: Response) => {
  deleteSpotifyUser();
  res.redirect("/");
});

app.post("/play", async (req, res) => {
  const user = getSpotifyUser();
  if (!user) {
    res.status(500).send("not logged in");
    return;
  }

  try {
    const devices = await getDevices(user.accessToken);
    const raspotifyDevice = devices.find(device =>
      device.name.startsWith("raspotify")
    );

    if (!raspotifyDevice) {
      res.status(500).send("no raspotify device found");
      return;
    }

    await play(user.accessToken, raspotifyDevice);

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
    const devices = await getDevices(user.accessToken);
    const raspotifyDevice = devices.find(device =>
      device.name.startsWith("raspotify")
    );

    if (!raspotifyDevice) {
      res.status(500).send("no raspotify device found");
      return;
    }

    await pause(user.accessToken, raspotifyDevice);
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
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}.`);
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
