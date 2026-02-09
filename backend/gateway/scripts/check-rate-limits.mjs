#!/usr/bin/env node
// Simple rate-limit checker for gateway user endpoints
// Usage: node scripts/check-rate-limits.mjs [BASE_URL]
// Defaults to http://localhost:8080/api

const DEFAULT_BASE = process.argv[2] || process.env.BASE_URL || 'http://localhost:8080/api';
const MAX_REQUESTS = Number(process.env.MAX_REQUESTS) || 30;
const CONCURRENCY = Number(process.env.CONCURRENCY) || 1;
const DELAY_MS = Number(process.env.DELAY_MS) || 1;

async function getFetch() {
  if (globalThis.fetch) return globalThis.fetch.bind(globalThis);
  try {
    const mod = await import('node-fetch');
    return mod.default;
  } catch (e) {
    console.error('fetch is not available. Run on Node 18+ or install node-fetch.');
    process.exit(1);
  }
}

const endpoints = [
  { method: 'GET', path: '/users' },
  { method: 'GET', path: '/users/user1' },
  { method: 'GET', path: '/users/id/1' },
  { method: 'POST', path: '/users', body: { username: 'tmp_test_user', email: 'tmp@example.com', password: 'pass' } },
  { method: 'DELETE', path: '/users/user1' },
];

function sleep(ms) { return new Promise((res) => setTimeout(res, ms)); }

async function runEndpointCheck(fetch, base, ep) {
  const url = base.replace(/\/$/, '') + ep.path;
  console.log(`\nTesting ${ep.method} ${url} (max ${MAX_REQUESTS} requests)`);
  const counts = new Map();
  let first429At = null;

  for (let i = 1; i <= MAX_REQUESTS; i++) {
    try {
      const opts = { method: ep.method, headers: { 'content-type': 'application/json' } };
      if (ep.body) opts.body = JSON.stringify(ep.body);
      const res = await fetch(url, opts);
      counts.set(res.status, (counts.get(res.status) || 0) + 1);
      if (res.status === 429 && first429At === null) first429At = i;
    } catch (err) {
      counts.set('ERR', (counts.get('ERR') || 0) + 1);
    }
    if (i % CONCURRENCY === 0) await sleep(DELAY_MS);
    if (first429At) break; // stop when we hit rate limit
  }

  console.log('Result summary:');
  for (const [k, v] of counts.entries()) console.log(`  ${k}: ${v}`);
  if (first429At) console.log(`  -> 429 observed at request #${first429At}`);
  else console.log('  -> No 429 observed (increase MAX_REQUESTS to probe further)');
}

async function main() {
  const fetch = await getFetch();
  console.log(`Base URL: ${DEFAULT_BASE}`);
  for (const ep of endpoints) {
    await runEndpointCheck(fetch, DEFAULT_BASE, ep);
  }
  console.log('\nDone.');
}

main().catch((e) => {
  console.error('Checker failed:', e);
  process.exit(1);
});
