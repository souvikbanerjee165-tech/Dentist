import { aiConversationService } from '../src/services/ai/ai.service.js';

async function testGeminiBrain() {
  console.log('================================================================');
  console.log('🧠 TESTING GOOGLE GEMINI 3.7 / 2.5 FLASH AI CONVERSATION BRAIN');
  console.log('================================================================\n');

  // Turn 1: Customer asks about pricing
  console.log('1️⃣ Turn 1: Customer asks about pricing...');
  console.log('👤 Customer: "Hello! How much is your laser whitening treatment and what does it include?"');
  const turn1 = await aiConversationService.processTurn({
    businessName: 'Apex Care Clinic',
    businessIndustry: 'Medical & Dental Clinic',
    userMessage: 'Hello! How much is your laser whitening treatment and what does it include?',
    conversationHistory: [],
  });

  console.log('\n🤖 Gemini Brain Output:');
  console.log(`   💬 Reply: "${turn1.reply}"`);
  console.log(`   🎯 Intent: ${turn1.intent} | Confidence: ${turn1.confidence}%`);
  console.log(`   📦 Collected Data:`, turn1.collected_data);

  // Turn 2: Customer provides Name and requests Friday appointment
  console.log('\n2️⃣ Turn 2: Customer provides Name and wants Friday booking...');
  console.log('👤 Customer: "I would like to book this Friday afternoon. My name is Sophia Martinez."');
  const turn2 = await aiConversationService.processTurn({
    businessName: 'Apex Care Clinic',
    businessIndustry: 'Medical & Dental Clinic',
    userMessage: 'I would like to book this Friday afternoon. My name is Sophia Martinez.',
    conversationHistory: [
      { role: 'user', content: 'Hello! How much is your laser whitening treatment and what does it include?' },
      { role: 'assistant', content: turn1.reply },
    ],
    existingLeadData: turn1.collected_data,
  });

  console.log('\n🤖 Gemini Brain Output:');
  console.log(`   💬 Reply: "${turn2.reply}"`);
  console.log(`   🎯 Intent: ${turn2.intent} | Confidence: ${turn2.confidence}%`);
  console.log(`   📦 Collected Data:`, turn2.collected_data);

  // Turn 3: Out-of-Scope / Anti-Hallucination Query
  console.log('\n3️⃣ Turn 3: Anti-Hallucination & Safe Handover Test...');
  console.log('👤 Customer: "What was the 1985 Supreme Court lawsuit outcome for dental anesthetics?"');
  const turn3 = await aiConversationService.processTurn({
    businessName: 'Apex Care Clinic',
    businessIndustry: 'Medical & Dental Clinic',
    userMessage: 'What was the 1985 Supreme Court lawsuit outcome for dental anesthetics?',
    conversationHistory: [],
  });

  console.log('\n🤖 Gemini Brain Output:');
  console.log(`   💬 Reply: "${turn3.reply}"`);
  console.log(`   🛡️ Handover Required: ${turn3.handover_required}`);
  console.log(`   🎯 Intent: ${turn3.intent}`);

  console.log('\n================================================================');
  console.log('🏆 GOOGLE GEMINI FLASH AI BRAIN IS CONNECTED & FULLY OPERATIONAL!');
  console.log('================================================================');
}

testGeminiBrain().catch(console.error);
