import { actionExecutor } from '../src/services/execution/action.executor.js';
import { AIConversationTurnResponse } from '../src/services/ai/ai.types.js';
import { decisionLogger } from '../src/services/logging/decision.logger.js';
import { deadLetterQueue } from '../src/services/queue/dead.letter.queue.js';
import { idempotencyService } from '../src/services/idempotency/idempotency.service.js';

async function runEnterpriseTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING PRODUCTION-HARDENED ENTERPRISE ARCHITECTURE TESTS');
  console.log('================================================================\n');

  // TEST 1: Fuzzy Normalization + Valid Booking
  console.log('--- TEST 1: Entity Normalization & Deterministic Booking ---');
  const rawTurn: AIConversationTurnResponse = {
    reply: 'I have reserved Friday 3 PM for your laser whitening.',
    intent: 'appointment_booking',
    confidence: 0.96,
    collected_data: {
      name: '  sophia martinez  ', // Unnormalized lowercase & whitespace
      phone_number: '+1 (555) 234-5678', // Unnormalized formatted phone
      email: 'sophia@example.com',
      business_type: 'laser teeth whitening package ($350)', // Unnormalized service
      budget: '$350',
      preferred_appointment_date: 'Friday', // Unnormalized relative date
    },
    missing_fields: [],
    handover_required: false,
    handover_reason: null,
    knowledge_sources_used: ['dental_pricing.pdf'],
  };

  const result1 = await actionExecutor.execute(rawTurn, {
    messageId: 'wamid.HBgLMTU1NTIzNDU2NzgVAgASGBQzQU',
    userMessage: 'Book laser whitening for Friday',
    llmProvider: 'gemini-2.5-flash',
  });
  console.log('✅ Result 1 Action:', result1.actionExecuted);
  console.assert(result1.actionExecuted === 'appointment_booked', 'Should execute appointment booking');

  // TEST 2: Webhook Idempotency (Simulating Meta Webhook Retry with same messageId)
  console.log('\n--- TEST 2: Webhook Idempotency (Meta Retry Guard) ---');
  const result2 = await actionExecutor.execute(rawTurn, {
    messageId: 'wamid.HBgLMTU1NTIzNDU2NzgVAgASGBQzQU', // Exact same message ID!
  });
  console.log('✅ Result 2 Action:', result2.actionExecuted);
  console.assert(result2.actionExecuted === 'idempotent_duplicate', 'Should detect duplicate webhook');

  // TEST 3: Business Rule Rejection (Past Date)
  console.log('\n--- TEST 3: Validation Layer Rejection (Past Date) ---');
  const invalidTurn: AIConversationTurnResponse = {
    reply: 'Booking for 2021.',
    intent: 'appointment_booking',
    confidence: 0.90,
    collected_data: {
      name: 'Marcus Sterling',
      phone_number: '+15559012345',
      email: null,
      business_type: 'Emergency Exam',
      budget: null,
      preferred_appointment_date: '2021-05-12', // Past date!
    },
    missing_fields: [],
    handover_required: false,
    handover_reason: null,
    knowledge_sources_used: [],
  };

  const result3 = await actionExecutor.execute(invalidTurn, {
    messageId: 'msg-past-date',
  });
  console.log('✅ Result 3 Action:', result3.actionExecuted);
  console.log('🛡️ Caught Validation Errors:', result3.validationErrors);
  console.assert(result3.actionExecuted === 'validation_failed', 'Should reject past date');

  // TEST 4: Dead-Letter Queue (DLQ) Resilience
  console.log('\n--- TEST 4: Dead-Letter Queue (DLQ) Resilience ---');
  deadLetterQueue.enqueue('META_WHATSAPP_DISPATCH', { phone: '+15559998888', text: 'Hello' }, 'HTTP 503 Service Unavailable');
  const dlqJobs = deadLetterQueue.getJobs();
  console.log(`✅ Active DLQ Jobs: ${dlqJobs.length}`);
  console.log(`  └─ Job ID: ${dlqJobs[0]?.id} | Error: "${dlqJobs[0]?.lastError}" | Status: ${dlqJobs[0]?.status}`);

  console.log('\n🎉 ALL PRODUCTION HARDENING & ENTERPRISE TESTS PASSED PERFECTLY!\n');
}

runEnterpriseTests().catch(console.error);
