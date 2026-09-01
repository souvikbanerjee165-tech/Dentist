import { spawn } from 'child_process';

const testSuites = [
  { name: 'AI Conversation Engine', script: 'scripts/test-ai-engine.ts' },
  { name: 'RAG Vector Search & Embeddings', script: 'scripts/test-rag-pipeline.ts' },
  { name: 'Google Calendar & Booking Guard', script: 'scripts/test-calendar-engine.ts' },
  { name: 'Lightweight CRM & Lead Scoring', script: 'scripts/test-crm-engine.ts' },
  { name: 'WhatsApp Cloud API & Webhook', script: 'scripts/test-whatsapp-webhook.ts' },
];

async function runAll() {
  console.log('================================================================');
  console.log('🚀 RUNNING COMPLETE PRODUCTION VERIFICATION SUITE');
  console.log('================================================================\n');

  for (const suite of testSuites) {
    console.log(`▶️ Running Suite: ${suite.name}...`);
    await new Promise<void>((resolve, reject) => {
      const child = spawn('npx.cmd', ['tsx', suite.script], { stdio: 'inherit', shell: true });
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Passed: ${suite.name}\n`);
          resolve();
        } else {
          reject(new Error(`Test Suite "${suite.name}" failed with exit code ${code}`));
        }
      });
    });
  }

  console.log('================================================================');
  console.log('🏆 ALL 5 PRODUCTION TEST SUITES PASSED WITH 100% SUCCESS!');
  console.log('================================================================');
}

runAll().catch((err) => {
  console.error('❌ Production Verification Error:', err.message);
  process.exit(1);
});
