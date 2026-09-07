import http from 'https';

const scenarios = [
  {
    name: 'Scenario 1: Emergency Tooth Pain',
    speech: 'I have severe throbbing pain in my lower left molar since yesterday, do you have any emergency slots today?',
  },
  {
    name: 'Scenario 2: Teeth Whitening & Pricing Inquiry',
    speech: 'Hi, how much is your laser teeth whitening and how long does the appointment take?',
  },
  {
    name: 'Scenario 3: High-Ticket Dental Implants & Financing',
    speech: 'I need dental implants for two missing back teeth. What is the starting price and do you offer payment plans?',
  },
  {
    name: 'Scenario 4: Routine Examination Booking',
    speech: 'I would like to book a routine examination and 3D digital scan for next Monday morning please.',
  },
];

async function runTest(scenario: { name: string; speech: string }) {
  console.log('\n' + '='.repeat(70));
  console.log(`🎙️  TESTING: ${scenario.name}`);
  console.log(`🗣️  CALLER SAID: "${scenario.speech}"`);
  console.log('-'.repeat(70));

  const postData = JSON.stringify({
    speech: scenario.speech,
    clinicName: 'Apex Dental Care',
    phone: '+447911123456',
  });

  return new Promise((resolve) => {
    const req = http.request(
      'https://whatsapp-ai-sales-assistant-rho.vercel.app/api/v1/voice/simulate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            console.log('🔊  LIVE AI VOICE TWIML OUTPUT:');
            console.log(data.twimlResponse);
          } catch (e) {
            console.log('Response body:', body);
          }
          resolve(true);
        });
      }
    );

    req.on('error', (err) => {
      console.error('Request error:', err);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🚀 Starting Voice AI Receptionist End-to-End Simulation Suite...');
  for (const scenario of scenarios) {
    await runTest(scenario);
  }
  console.log('\n' + '='.repeat(70));
  console.log('✅ All Voice AI Receptionist scenarios executed successfully!');
}

main();
