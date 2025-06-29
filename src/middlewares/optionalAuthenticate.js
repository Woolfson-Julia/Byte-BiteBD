// middlewares/optionalAuthenticate.js
import { SessionsCollection } from '../models/sessionSchema.js';
import { UsersCollection } from '../models/userSchema.js';

export const optionalAuthenticate = async (req, res, next) => {
  const { authorization } = req.headers;

  if (typeof authorization !== 'string') {
    req.user = null;
    return next();
  }

  const [bearer, accessToken] = authorization.split(' ', 2);

  if (bearer !== 'Bearer' || typeof accessToken !== 'string') {
    req.user = null;
    return next();
  }

  const session = await SessionsCollection.findOne({ accessToken });

  if (!session || new Date() > new Date(session.accessTokenValidUntil)) {
    req.user = null;
    return next();
  }

  const user = await UsersCollection.findById(session.userId);

  if (!user) {
    req.user = null;
    return next();
  }

  req.user = user;
  next();
};
