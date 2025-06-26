import { Router } from 'express';
import express from 'express';

// import { ctrlWrapper } from '../utils/ctrlWrapper.js';

// import {
//   registerUserSchema,
//   loginUserSchema,
//   requestResetEmailSchema,
//   resetPasswordSchema,
//   loginWithGoogleOAuthSchema,
// } from '../validation/auth.js';
// import {
//   registerUserController,
//   loginUserController,
//   logoutUserController,
//   refreshUserSessionController,
//   requestResetEmailController,
//   resetPasswordController,
//   getGoogleOAuthUrlController,
//   loginWithGoogleController,
// } from '../controllers/auth.js';

// import { validateBody } from '../middlewares/validateBody.js';

const router = Router();
const jsonParser = express.json();

router.post(
  '/register',
  jsonParser,
  // validateBody(registerUserSchema),
  // ctrlWrapper(registerUserController),
);

router.post(
  '/login',
  jsonParser,
  // validateBody(loginUserSchema),
  // ctrlWrapper(loginUserController),
);

// router.post('/logout', ctrlWrapper(logoutUserController));

// router.post('/refresh', ctrlWrapper(refreshUserSessionController));

router.post(
  '/send-reset-email',
  jsonParser,
  // validateBody(requestResetEmailSchema),
  // ctrlWrapper(requestResetEmailController),
);

router.post(
  '/reset-password',
  jsonParser,
  // validateBody(resetPasswordSchema),
  // ctrlWrapper(resetPasswordController),
);

// router.get('/get-oauth-url', ctrlWrapper(getGoogleOAuthUrlController));

router.post(
  '/confirm-oauth',
  jsonParser,
  // validateBody(loginWithGoogleOAuthSchema),
  // ctrlWrapper(loginWithGoogleController),
);

export default router;
