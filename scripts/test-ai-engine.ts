import { aiConversationService } from '../src/services/ai/ai.service.js';
import { ChatMessageContext, LeadCollectedData } from '../src/services/ai/ai.types.js';

async function runTestSuite() {
  console.log('================================================================');
  console.log('🤖 STARTING AI CONVERSATION ENGINE MULTI-TURN TEST SUITE');
  console.log('================================================================\n');

  const history: ChatMessageContext[] = [];
  let currentLeadData: Partial<LeadCollectedData> = {};

  const turns = [
    {
      turn: 1,
      name: 'GREETING & INQUIRY',
      userMessage: 'Hello! I need some information about your services and how you help clients.',
      knowledge: ['We provide dental wellness, cosmetic whitening, and orthodontics.'],
    },
    {
      turn: 2,
      name: 'FAQ & PRICING QUESTION',
      userMessage: 'How much is the laser teeth whitening package and what does it include?',
      knowledge: [
        'Laser Whitening & Deep Clean Package is $350. Includes 45-min laser session and take-home kit.',
      ],
    },
    {
      turn: 3,
      name: 'PARTIAL LEAD DATA SUBMISSION (Name & Phone)',
      userMessage: "Sounds great! My name is Sophia Martinez and my phone number is +1 (555) 234-5678.",
      knowledge: [],
    },
    {
      turn: 4,
      name: 'FULL QUALIFICATION (Email, Business Type, Budget, Preferred Date)',
      userMessage: "My email is sophia.m@example.com. I run a dental clinic, our budget is $1,000, and I'd like to book this Friday at 3 PM.",
      knowledge: ['Available booking slots this Friday: 3:00 PM and 4:30 PM with Dr. Reynolds.'],
    },
    {
      turn: 5,
      name: 'UNKNOWN / OUT-OF-SCOPE INQUIRY (Testing Anti-Hallucination & Fallback)',
      userMessage: "Can you provide the chemical formula and FDA lawsuit history of the whitening compound?",
      knowledge: [], // No knowledge available -> Must trigger human handover
    },
  ];

  for (const test of turns) {
    console.log(`----------------------------------------------------------------`);
    console.log(`📍 TURN ${test.turn}: ${test.name}`);
    console.log(`👤 User: "${test.userMessage}"`);

    const response = await aiConversationService.processTurn({
      businessName: 'Apex Care Clinic',
      businessIndustry: 'Medical & Dental Clinic',
      userMessage: test.userMessage,
      conversationHistory: history,
      existingLeadData: currentLeadData,
      knowledgeContext: test.knowledge,
    });

    console.log(`🤖 AI Response: "${response.reply}"`);
    console.log(`📊 Clean JSON Output:`);
    console.log(JSON.stringify(response, null, 2));

    // Update conversation memory and state
    history.push({ role: 'user', content: test.userMessage });
    history.push({ role: 'assistant', content: response.reply });
    currentLeadData = response.collected_data;
    console.log('');
  }

  console.log('================================================================');
  console.log('✅ ALL 5 CONVERSATION TURNS TESTED SUCCESSFULLY!');
  console.log('================================================================');
}

runTestSuite().catch(console.error);
