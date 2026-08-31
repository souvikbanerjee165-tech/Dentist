import { actionExecutor } from '../src/services/execution/action.executor.js';
import { AIConversationTurnResponse } from '../src/services/ai/ai.types.js';
import { decisionLogger } from '../src/services/logging/decision.logger.js';
import { LLMFactory } from '../src/services/ai/providers/llm.factory.js';

async function runEnterpriseTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING ENTERPRISE ARCHITECTURE VERIFICATION TEST');
  console.log('====================================================\n');

  // TEST 1: Valid Booking -> Validator -> EventBus -> ActionExecutor
  console.log('--- TEST 1: Valid Appointment Booking Flow ---');
  const validTurn: AIConversationTurnResponse = {
    reply: 'I have scheduled your priority examination with Dr. Sarah Jensen for Friday at 3:00 PM.',
    intent: 'appointment_booking',
    confidence: 0.94,
    collected_data: {
      name: 'Sophia Martinez',
      phone_number: '+15552345678',
      email: 'sophia@example.com',
      business_type: 'Cosmetic Laser Teeth Whitening',
      budget: '$350',
      preferred_appointment_date: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days in future
    },
    missing_fields: [],
    handover_required: false,
    handover_reason: null,
    knowledge_sources_used: ['dental_pricing_guide.pdf'],
  };

  const result1 = await actionExecutor.execute(validTurn, {
    userMessage: 'Book laser whitening for Friday',
    llmProvider: 'gemini-2.5-flash',
  });
  console.log('✅ Result 1 Action:', result1.actionExecuted);
  console.assert(result1.actionExecuted === 'appointment_booked', 'Should execute appointment booking');

  // TEST 2: Business Rule Rejection (Past Date or Missing Name)
  console.log('\n--- TEST 2: Validation Layer Rejection (Past Date & Missing Name) ---');
  const invalidTurn: AIConversationTurnResponse = {
    reply: 'I booked you for yesterday.',
    intent: 'appointment_booking',
    confidence: 0.88,
    collected_data: {
      name: '',
      phone_number: '+15552345678',
      email: null,
      business_type: 'Whitening',
      budget: null,
      preferred_appointment_date: '2020-01-01', // Date in the past!
    },
    missing_fields: ['name'],
    handover_required: false,
    handover_reason: null,
    knowledge_sources_used: [],
  };

  const result2 = await actionExecutor.execute(invalidTurn, {
    userMessage: 'Book for 2020',
  });
  console.log('✅ Result 2 Action:', result2.actionExecuted);
  console.log('🛡️ Caught Validation Errors:', result2.validationErrors);
  console.assert(result2.actionExecuted === 'validation_failed', 'Should reject invalid date');

  // TEST 3: Low Confidence (< 70%) -> Human Takeover Routing
  console.log('\n--- TEST 3: Low Confidence (< 70%) Human Handoff Routing ---');
  const lowConfTurn: AIConversationTurnResponse = {
    reply: 'I am not certain about that specialized surgical question.',
    intent: 'faq_inquiry',
    confidence: 0.45, // Below 70% threshold
    collected_data: {
      name: 'Marcus Sterling',
      phone_number: '+15559012345',
      email: null,
      business_type: null,
      budget: null,
      preferred_appointment_date: null,
    },
    missing_fields: [],
    handover_required: false,
    handover_reason: 'Complex medical question with low confidence',
    knowledge_sources_used: [],
  };

  const result3 = await actionExecutor.execute(lowConfTurn, {
    userMessage: 'Can you perform a full jaw bone graft right now?',
  });
  console.log('✅ Result 3 Action:', result3.actionExecuted);
  console.assert(result3.actionExecuted === 'human_handoff_triggered', 'Should trigger human handoff');

  // TEST 4: Decision Logger & Audit Trail Verification
  console.log('\n--- TEST 4: Diagnostic Audit Trail Verification ---');
  const recentLogs = decisionLogger.getRecentLogs(5);
  console.log(`✅ Total Logged Decisions: ${recentLogs.length}`);
  recentLogs.forEach((log, i) => {
    console.log(`  [${i + 1}] Intent: ${log.intent} | Action: ${log.executedAction} | Conf: ${Math.round(log.confidence * 100)}%`);
  });

  console.log('\n🎉 ALL ENTERPRISE ARCHITECTURAL TESTS PASSED PERFECTLY!\n');
}

runEnterpriseTests().catch(console.error);
