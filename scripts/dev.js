import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const log = (msg) => console.log(msg);
const error = (msg) => { console.error(msg); process.exit(1); };

log('🚀 Starting Acquisition App in Development Mode');
log('================================================');

// ── Check .env.development exists ─────────────────
if (!fs.existsSync('.env.development')) {
  error('❌ Error: .env.development file not found!');
}

// ── Check Docker is running ────────────────────────
const dockerCheck = spawnSync('docker', ['info'], { stdio: 'ignore' });
if (dockerCheck.status !== 0) {
  error('❌ Error: Docker is not running!\n   Please start Docker Desktop and try again.');
}

// ── Create .neon_local directory ───────────────────
fs.mkdirSync('.neon_local', { recursive: true });
log('✅ .neon_local directory ready');

// ── Add .neon_local to .gitignore ──────────────────
const gitignorePath = path.resolve('.gitignore');
const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
if (!gitignoreContent.includes('.neon_local/')) {
  fs.appendFileSync(gitignorePath, '\n.neon_local/\n');
  log('✅ Added .neon_local/ to .gitignore');
}

log('\n📦 Starting containers in background...');

// ── Step 1 : Start containers in background ────────
try {
  execSync('docker compose -f docker-compose.dev.yml up -d --build', { stdio: 'inherit' });
} catch {
  error('❌ Failed to start Docker containers.');
}

// ── Step 2 : Wait for neon-local to be healthy ─────
log('\n⏳ Waiting for neon-local to be healthy...');

const maxRetries = 20;
let ready = false;

for (let i = 1; i <= maxRetries; i++) {
  const result = spawnSync(
    'docker', ['compose', '-f', 'docker-compose.dev.yml', 'exec', 'neon-local',
    'pg_isready', '-h', 'localhost', '-p', '5432', '-U', 'neon'],
    { stdio: 'ignore' }
  );

  if (result.status === 0) {
    ready = true;
    log('✅ Database is ready!');
    break;
  }

  process.stdout.write(`   Attempt ${i}/${maxRetries}...\r`);

  // Wait 3 seconds between retries
  execSync('node -e "setTimeout(()=>{},3000)"');
}

if (!ready) {
  error('❌ Database never became healthy after max retries.');
}

// ── Step 3 : Run migrations ────────────────────────
log('\n📜 Applying latest schema with Drizzle...');
try {
  execSync('npm run db:migrate', { stdio: 'inherit' });
} catch {
  error('❌ Migration failed. Check your database connection.');
}

// ── Step 4 : Attach to logs ────────────────────────
log('\n🎉 Development environment started!');
log('   Application: http://localhost:3000');
log('   Database:    postgres://neon:npg@localhost:5432/neondb\n');
log('📋 Following logs (Ctrl+C to stop)...\n');

spawnSync('docker', ['compose', '-f', 'docker-compose.dev.yml', 'logs', '-f'], { stdio: 'inherit' });