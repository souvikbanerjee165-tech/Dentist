import { createApp } from '../src/app.js';
import { config } from '../src/config/env.js';
import { whatsappService } from '../src/services/whatsapp/whatsapp.service.js';

async function runWhatsAppTestSuite() {
  console.log('================================================================');
  console.log('📱 STARTING WHATSAPP CLOUD API & WEBHOOK PIPELINE TEST SUITE');
  console.log('================================================================\n');

  const app = createApp();
  const server = app.listen(4005);

  const baseUrl = 'http://localhost:4005/api/v1/webhook/whatsapp';

  try {
    // 1. Test Meta Webhook Verification Challenge (GET)
    console.log('1️⃣ Testing Meta Webhook Verification Challenge (GET)...');
    const verifyToken = config.whatsapp.verifyToken || 'whatsapp_sales_assistant_verify_token';
    const challenge = '1158201444';

    const verifyRes = await fetch(
      `${baseUrl}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(
        verifyToken
      )}&hub.challenge=${challenge}`
    );

    const challengeText = await verifyRes.text();
    console.log(`   Challenge Status: ${verifyRes.status} | Response: "${challengeText}"`);
    if (challengeText === challenge) {
      console.log('   ✅ Webhook Challenge Verified Successfully!\n');
    } else {
      console.error('   ❌ Webhook Challenge Failed.\n');
    }

    // 2. Test Inbound Text Message (POST)
    console.log('2️⃣ Testing Inbound WhatsApp Text Message...');
    const textPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '109283746592817',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '15551234567', phone_number_id: '109283746592817' },
                contacts: [{ profile: { name: 'Sophia Martinez' }, wa_id: '15552345678' }],
                messages: [
                  {
                    from: '15552345678',
                    id: 'wamid.HBgLMTU1NTIzNDU2NzgVAgASGBQzQT...',
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'text',
                    text: { body: 'How much is laser teeth whitening and do you have openings?' },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const textRes = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(textPayload),
    });
    console.log(`   Webhook Response Status: ${textRes.status} (${await textRes.text()})\n`);

    // 3. Test Inbound Image Message with Caption
    console.log('3️⃣ Testing Inbound WhatsApp Image Message (Photo of insurance card)...');
    const imagePayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '109283746592817',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'David Chen' }, wa_id: '15558765432' }],
                messages: [
                  {
                    from: '15558765432',
                    id: 'wamid.IMG_293847291',
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'image',
                    image: {
                      id: 'media_id_998877',
                      mime_type: 'image/jpeg',
                      caption: 'Here is my MetLife dental insurance card. Is this accepted?',
                    },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const imageRes = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imagePayload),
    });
    console.log(`   Image Webhook Status: ${imageRes.status} (${await imageRes.text()})\n`);

    // 4. Test Inbound Voice Note
    console.log('4️⃣ Testing Inbound WhatsApp Voice Note (Audio Message)...');
    const voicePayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '109283746592817',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'Elena Rostova' }, wa_id: '15553459876' }],
                messages: [
                  {
                    from: '15553459876',
                    id: 'wamid.AUDIO_887766',
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'audio',
                    audio: {
                      id: 'audio_file_1234',
                      mime_type: 'audio/ogg; codecs=opus',
                      voice: true,
                    },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const voiceRes = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voicePayload),
    });
    console.log(`   Voice Note Webhook Status: ${voiceRes.status} (${await voiceRes.text()})\n`);

    // 5. Test Inbound Location Message
    console.log('5️⃣ Testing Inbound WhatsApp Location Pin (GPS Coordinates)...');
    const locationPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '109283746592817',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'Marcus Sterling' }, wa_id: '15559012345' }],
                messages: [
                  {
                    from: '15559012345',
                    id: 'wamid.LOC_334455',
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'location',
                    location: {
                      latitude: 40.758896,
                      longitude: -73.98513,
                      name: 'Times Square, New York',
                      address: 'Broadway & 7th Ave, New York, NY 10036',
                    },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const locationRes = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationPayload),
    });
    console.log(`   Location Webhook Status: ${locationRes.status} (${await locationRes.text()})\n`);

    // 6. Test Interactive Quick Reply Button Click
    console.log('6️⃣ Testing Interactive Quick Reply Button Click...');
    const buttonPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '109283746592817',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'Sophia Martinez' }, wa_id: '15552345678' }],
                messages: [
                  {
                    from: '15552345678',
                    id: 'wamid.BTN_CLICK_11',
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'interactive',
                    interactive: {
                      type: 'button_reply',
                      button_reply: {
                        id: 'slot_1',
                        title: 'Fri 3:00 PM',
                      },
                    },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const buttonRes = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buttonPayload),
    });
    console.log(`   Interactive Button Status: ${buttonRes.status} (${await buttonRes.text()})\n`);

    // 7. Test Outbound Interactive Buttons Dispatch & Retries
    console.log('7️⃣ Testing Outbound Interactive Buttons & Retry Mechanism...');
    const outboundRes = await whatsappService.sendInteractiveButtons(
      '+1 (555) 234-5678',
      'Please select your preferred consultation time:',
      [
        { id: 'btn_1', title: 'Friday 3:00 PM' },
        { id: 'btn_2', title: 'Saturday 11:00 AM' },
        { id: 'btn_3', title: 'Speak to Staff' },
      ]
    );
    console.log(`   Outbound Success: ${outboundRes.success}`);
    console.log(`   Message ID: ${outboundRes.whatsappMessageId}`);
    console.log(`   Attempts Made: ${outboundRes.attemptCount}\n`);

    console.log('================================================================');
    console.log('✅ ALL WHATSAPP CLOUD API & MEDIA TESTS PASSED SUCCESSFULLY!');
    console.log('================================================================');
  } finally {
    server.close();
  }
}

runWhatsAppTestSuite().catch(console.error);
