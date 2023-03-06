import passport from "passport";

import { googleStrategy } from "../helpers/strategies/googleStrategy.js";
import { facebookStrategy } from "../helpers/strategies/facebookStrategy.js";

passport.use("google", googleStrategy);
passport.use("facebook", facebookStrategy);

export default passport;
