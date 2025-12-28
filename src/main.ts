import { bootstrap } from './bootstrap/bootstrap';
import 'dotenv/config';
async function main() {
  try {
    await bootstrap();
  } catch (error) {
    console.error('❌ Application failed to start', error);
    process.exit(1);
  }
}

main();
