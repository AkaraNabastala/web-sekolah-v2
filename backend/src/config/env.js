import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const configDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(configDir, '../../');
// Prioritaskan backend/.env, lalu root .env. Host environment variables tetap dipertahankan.
dotenv.config({ path: path.join(backendRoot, '.env') });
dotenv.config({ path: path.resolve(backendRoot, '../.env') });
