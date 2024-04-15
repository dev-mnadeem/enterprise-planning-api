import { startServer } from './app';

startServer().catch((error) => {
  console.error('Server failed to start!', error);
  process.exit(1);
});
