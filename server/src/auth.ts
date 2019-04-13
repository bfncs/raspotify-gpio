import { Response, Router } from "express";
import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import config from "./config";
import { SpotifyUser } from "./models/spotify";
import { deleteSpotifyUser, setSpotifyUser } from "./persistence";

passport.use(
  new SpotifyStrategy(
    config.spotify,
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

export const authRouter = Router();

authRouter.get(
  "/spotify",
  passport.authenticate("spotify", {
    scope: ["user-read-playback-state", "user-modify-playback-state"]
  })
);

authRouter.get(
  "/spotify/callback",
  passport.authenticate("spotify", { failureFlash: true, session: false }),
  (_, res: Response) => {
    res.redirect("/");
  }
);

authRouter.post("/spotify/delete", (_, res: Response) => {
  deleteSpotifyUser();
  res.redirect("/");
});
