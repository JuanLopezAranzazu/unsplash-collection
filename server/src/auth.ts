import passport from "passport";
import { Router, Request, Response, NextFunction } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from "jsonwebtoken";
import { User } from "./models";

const { SERVER_URL, CLIENT_URL, JWT_SECRET = "dev" } = process.env;

const upsert = async (provider: string, p: any) =>
  User.findOneAndUpdate(
    { provider, providerId: p.id },
    { name: p.displayName || p.username, avatar: p.photos?.[0]?.value },
    { upsert: true, new: true },
  );

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${SERVER_URL}/auth/google/callback`,
    },
    async (_a, _r, profile, done) =>
      done(null, await upsert("google", profile)),
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${SERVER_URL}/auth/github/callback`,
    },
    async (_a: string, _r: string, profile: any, done: any) =>
      done(null, await upsert("github", profile)),
  ),
);

export interface AuthReq extends Request {
  userId?: string;
}

export const requireAuth = (
  req: AuthReq,
  res: Response,
  next: NextFunction,
) => {
  try {
    req.userId = (jwt.verify(req.cookies.token, JWT_SECRET) as any).id;
    next();
  } catch {
    res.status(401).json({ error: "Inicia sesión para continuar" });
  }
};

const router = Router();
const callback = (provider: string) => [
  passport.authenticate(provider, {
    session: false,
    failureRedirect: `${CLIENT_URL}/login`,
  }),
  (req: Request, res: Response) => {
    const token = jwt.sign({ id: (req.user as any)._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 864e5,
      secure: process.env.NODE_ENV === "production",
    });
    res.redirect(CLIENT_URL!);
  },
];

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get("/google/callback", ...callback("google"));
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false }),
);
router.get("/github/callback", ...callback("github"));
router.get("/me", requireAuth, async (req: AuthReq, res) =>
  res.json(await User.findById(req.userId)),
);
router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

export default router;
