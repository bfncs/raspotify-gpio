declare module "passport-spotify" {
  import { Request } from "express";
  import { Strategy as PassportStrategy } from "passport";
  export class Strategy implements PassportStrategy {
    authenticate(req: Request, options?: any): any;
    constructor(
      params: { clientID: string; clientSecret: string; callbackURL: string },
      verify: (
        accessToken: string,
        refreshToken: string,
        expiresIn: string,
        profile: { id: string },
        done: (err: Error | null, user: any | null) => void
      ) => void
    );
  }
}
