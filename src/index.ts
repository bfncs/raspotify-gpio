import axios from "axios";
import express, { Application, Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import setupGpio from "./gpio";

console.log("Starting raspotify-gpio…");

const { PORT = 8080, CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } = process.env;

interface Device {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

const getDevices = async (accessToken: string): Promise<Device[]> => {
  const res = await axios.get<{ devices: Device[] }>(
    "https://api.spotify.com/v1/me/player/devices",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  return res.data.devices;
};

const play = async (accessToken: string, device: Device): Promise<void> => {
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

const pause = async (accessToken: string, device: Device): Promise<void> => {
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

interface User {
  id: string;
  accessToken: string;
  refreshToken: string;
}

let currentUser: User | null = null;

passport.serializeUser<User, string>((user, done) => {
  done(null, user.id);
});

passport.deserializeUser<User, string>((id, done) => {
  if (currentUser && currentUser.id === id) {
    done(null, currentUser);
  } else {
    done(new Error(`Unable to find user with id: ${id}`));
  }
});
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
      const user = {
        id,
        accessToken,
        refreshToken
      };
      currentUser = user;
      done(null, user);
    }
  )
);

const app: Application = express();
app.use(session({ secret: "cats" }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", async (req: Request, res) => {
  const { user } = req;
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
  passport.authenticate("spotify", { failureFlash: true }),
  (_, res: Response) => {
    res.redirect("/");
  }
);

app.post("/play", async (req, res) => {
  if (!currentUser) {
    res.status(500).send("not logged in");
    return;
  }

  try {
    const devices = await getDevices(currentUser.accessToken);
    const raspotifyDevice = devices.find(device =>
      device.name.startsWith("raspotify")
    );

    if (!raspotifyDevice) {
      res.status(500).send("no raspotify device found");
      return;
    }

    await play(currentUser.accessToken, raspotifyDevice);

    res.redirect("/");
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

app.post("/pause", async (req, res) => {
  if (!currentUser) {
    res.status(500).send("not logged in");
    return;
  }

  try {
    const devices = await getDevices(currentUser.accessToken);
    const raspotifyDevice = devices.find(device =>
      device.name.startsWith("raspotify")
    );

    if (!raspotifyDevice) {
      res.status(500).send("no raspotify device found");
      return;
    }

    await pause(currentUser.accessToken, raspotifyDevice);
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
