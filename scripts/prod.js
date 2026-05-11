import { execSync, spawnSync } from 'child_process';
import fs from 'fs';

const log = (msg) => console.log(msg);
const error = (msg) => { console.error(msg); process.exit(1); };

log('🚀 Starting Acquisition App in Production Mode');
log('===============================================');

// ── Check .env.production exists ──────────────────
if (!fs.existsSync('.env.production')) {
  error('❌ Error: .env.production file not found!\n   Please create .env.production with your production environment variables.');
}

// ── Check Docker is running ────────────────────────
const dockerCheck = spawnSync('docker', ['info'], { stdio: 'ignore' });
if (dockerCheck.status !== 0) {
  error('❌ Error: Docker is not running!\n   Please start Docker and try again.');
}

log('\n📦 Building and starting production container...');
log('   - Using Neon Cloud Database (no local proxy)');
log('   - Running in optimized production mode\n');

// ── Start production containers ────────────────────
try {
  execSync('docker compose -f docker-compose.prod.yml up --build -d', { stdio: 'inherit' });
} catch {
  error('❌ Failed to start production containers.');
}

// ── Wait for app to be ready ───────────────────────
log('\n⏳ Waiting for app to be ready...');

const maxRetries = 10;
let ready = false;

for (let i = 1; i <= maxRetries; i++) {
  try {
    execSync('node -e "require(\'http\').get(\'http://localhost:3000/health\', r => process.exit(r.statusCode===200?0:1))"', { stdio: 'ignore' });
    ready = true;
    log('✅ App is ready!');
    break;
  } catch {
    process.stdout.write(`   Attempt ${i}/${maxRetries}...\r`);
    execSync('node -e "setTimeout(()=>{},3000)"');
  }
}

if (!ready) {
  error('❌ App never became healthy. Check logs:\n   docker logs acquisitions-app-prod');
}

// ── Run migrations ─────────────────────────────────
log('\n📜 Applying latest schema with Drizzle...');
try {
  execSync('npm run db:migrate', { stdio: 'inherit' });
} catch {
  error('❌ Migration failed. Check your database connection.');
}

log('\n🎉 Production environment started!');
log('   Application: http://localhost:3000\n');
log('Useful commands:');
log('   View logs : docker logs -f acquisitions-app-prod');
log('   Stop app  : docker compose -f docker-compose.prod.yml down');