import { ONE_DAY } from '../constants/index.js';
import {
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
} from '../services/auth.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

export const registerUserController = async (req, res) => {
  const { user, session } = await registerUser(req.body);

  setupSession(res, session);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      user,
      accessToken: session.accessToken,
    },
  });
};

export const loginUserController = async (req, res) => {
  const { user, session } = await loginUser(req.body);

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: {
      user,
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const refreshUserSessionController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  const session = await refreshUsersSession(sessionId, refreshToken);

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
