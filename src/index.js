import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';

import { createDirIfNotExists } from './utils/createDirIfNotExists.js';
import { TEMP_UPLOAD_DIR } from './constants/index.js';

const bootstrap = async () => {
  await initMongoConnection();
  await createDirIfNotExists(TEMP_UPLOAD_DIR);
  setupServer();
};

bootstrap();
