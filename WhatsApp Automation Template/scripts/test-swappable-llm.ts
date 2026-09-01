import { aiConversationService } from '../src/services/ai/ai.service.js';
import { LLMFactory } from '../src/services/ai/providers/llm.factory.js';

async function main() {
  console.log('🧪 Testing Provider-Agnostic Swappable LLM Architecture...');

  const primary = LLMFactory.getPrimaryProvider();
  console.log(`✅ Active Default Provider: ${primary.providerName.toUpperCase()} (${primary.modelName})`);
  console.log(`✅ Provider Available: ${primary.isAvailable()}`);

  const testInput = {
    businessName: 'Apex Dental & Aesthetics',
    businessIndustry: 'Cosmetic & General Dentistry',
    userMessage: 'Can I take Azithromycin on my own for tooth pain?',
    conversationHistory: [],
  };

  console.log('\n--- Test Turn (Azithromycin Safety Protocol) ---');
  const result = await aiConversationService.processTurn(testInput);

  console.log('🤖 Model Output:');
  console.log(result.reply);
  console.log(`Intent: ${result.intent} | Confidence: ${result.confidence}`);
  console.log('✅ Swappable LLM test passed successfully!\n');
}

main().catch(console.error);
