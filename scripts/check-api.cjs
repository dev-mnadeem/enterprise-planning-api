// Run only against a disposable local/test database.
const { spawn } = require('node:child_process');
require('reflect-metadata');
require('dotenv').config();
if (!['local', 'test'].includes(process.env.ENVIRONMENT)) {
  throw new Error('Set ENVIRONMENT=local or test and configure a disposable database');
}
async function main() {
  const { AppDataSource: db } = require('../build/src/database/data-source');
  await db.initialize();
  try {
    for (const name of ['permission', 'userRole', 'admin']) {
      const Seed = require('../build/src/seeding/seeders/' + name + '.seeder').default;
      await new Seed().run(db);
    }
  } finally { await db.destroy(); }
  const child = spawn(process.execPath, ['build/src/server.js'], { stdio: 'inherit', env: process.env });
  try {
    const origin = 'http://127.0.0.1:' + (process.env.PORT || '3006');
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error('API exited during startup');
      try { if ((await fetch(origin + '/health')).ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!ready) throw new Error('API readiness timeout');
    const test = spawn('npm', ['run', 'test:api'], {
      stdio: 'inherit', env: { ...process.env, API_BASE: origin + '/api' },
    });
    const code = await new Promise(resolve => test.once('exit', resolve));
    if (code !== 0) throw new Error('Authorization contract tests failed');
  } finally { child.kill('SIGTERM'); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
