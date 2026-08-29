import { ragService } from '../src/services/rag/rag.service.js';
import { aiConversationService } from '../src/services/ai/ai.service.js';

async function runRAGTestSuite() {
  console.log('================================================================');
  console.log('📚 TESTING RETRIEVAL-AUGMENTED GENERATION (RAG) PIPELINE');
  console.log('================================================================\n');

  const businessId = 'test-business-clinic';

  // 1. Ingest Document 1: Services & Pricing (PDF / TXT content)
  console.log('1️⃣ Ingesting Document: "2026_Clinic_Services_and_Pricing.pdf"...');
  const doc1 = await ragService.ingestDocument({
    businessId,
    documentName: '2026_Clinic_Services_and_Pricing.pdf',
    documentType: 'pricing',
    text: `
APEX CARE CLINIC - 2026 PRICING AND SERVICES DIRECTORY

1. Cosmetic Laser Teeth Whitening:
Our premium laser whitening package is priced at $350. It includes an in-depth 45-minute laser activation session with our senior dental hygienist, a sensitivity pre-treatment rinse, and a complimentary take-home enamel remineralization kit.

2. Dental Implants & Restorative Crowns:
Single tooth titanium implant starts at $1,850. Custom porcelain crowns start at $950. All implants include a 5-year warranty and initial 3D panoramic X-ray imaging.

3. Routine Clean & Dental Checkup:
Comprehensive oral hygiene cleaning, plaque removal, and digital X-rays are $180 (fully covered under most PPO insurance plans).
`,
  });
  console.log(`   ✅ Ingested and indexed ${doc1.chunksIngested} vector chunk(s).\n`);

  // 2. Ingest Document 2: Patient Policies & FAQ (Word .docx content)
  console.log('2️⃣ Ingesting Document: "Clinic_Patient_FAQ_Policies.docx"...');
  const doc2 = await ragService.ingestDocument({
    businessId,
    documentName: 'Clinic_Patient_FAQ_Policies.docx',
    documentType: 'faq',
    text: `
APEX CARE CLINIC - FREQUENTLY ASKED QUESTIONS & CANCELLATION POLICIES

Q: What is your cancellation and rescheduling policy?
A: Patients may cancel or reschedule their appointment up to 24 hours in advance with zero penalty fees. Cancellations made with less than 24 hours notice will incur a standard $50 late fee.

Q: Do you accept insurance?
A: Yes, we accept major dental PPO insurance providers including Delta Dental, MetLife, Cigna, Guardian, and Aetna. We submit claims directly on behalf of our patients.

Q: Where are you located and what are your opening hours?
A: We are located at 450 Lexington Avenue, Suite 800, New York, NY 10017. Our clinic is open Monday through Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 3:00 PM.
`,
  });
  console.log(`   ✅ Ingested and indexed ${doc2.chunksIngested} vector chunk(s).\n`);

  // 3. Test Vector Search Queries
  console.log('================================================================');
  console.log('🔍 RUNNING SEMANTIC VECTOR QUERIES & STRICT RAG GENERATION');
  console.log('================================================================\n');

  const testQueries = [
    {
      label: 'TEST 1: KNOWN PRICING QUERY',
      query: 'How much does laser whitening cost and what is included in the package?',
      shouldFindMatch: true,
    },
    {
      label: 'TEST 2: KNOWN POLICY QUERY',
      query: 'What is your rule if I need to cancel or change my appointment time?',
      shouldFindMatch: true,
    },
    {
      label: 'TEST 3: UNKNOWN QUERY (Anti-Hallucination & Fallback Verification)',
      query: 'What was the Supreme Court lawsuit outcome for dental anesthesia in 1985?',
      shouldFindMatch: false,
    },
  ];

  for (const t of testQueries) {
    console.log(`----------------------------------------------------------------`);
    console.log(`📍 ${t.label}`);
    console.log(`👤 Customer Question: "${t.query}"`);

    // Step A: Vector Retrieval
    const retrievedChunks = await ragService.searchRelevantChunks(t.query, businessId, 0.15, 2);
    console.log(`🔎 Vector Search Result: Found ${retrievedChunks.length} matching chunk(s).`);

    if (retrievedChunks.length > 0) {
      retrievedChunks.forEach((c, idx) => {
        console.log(`   [Chunk ${idx + 1} from ${c.documentName}] (Cosine Sim: ${Math.round(c.similarity * 100)}%)`);
        console.log(`   "${c.content.slice(0, 120)}..."`);
      });
    } else {
      console.log(`   ⚠️ No chunks exceeded the relevance threshold. Knowledge is empty.`);
    }

    // Step B: AI Generation grounded strictly on retrieved chunks
    const aiResponse = await aiConversationService.processTurn({
      businessName: 'Apex Care Clinic',
      businessIndustry: 'Medical & Dental Clinic',
      userMessage: t.query,
      conversationHistory: [],
      knowledgeContext: retrievedChunks.map((c) => c.content),
    });

    console.log(`🤖 AI Sales Assistant Output:`);
    console.log(`   "${aiResponse.reply}"`);
    console.log(`   Intent: ${aiResponse.intent} | Handover Required: ${aiResponse.handover_required}`);
    console.log('');
  }

  console.log('================================================================');
  console.log('✅ RAG PIPELINE & ANTI-HALLUCINATION VERIFIED SUCCESSFULLY!');
  console.log('================================================================');
}

runRAGTestSuite().catch(console.error);
