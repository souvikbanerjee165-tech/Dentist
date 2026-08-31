import fetch from 'node-fetch';

const TOKEN = 'EAAVmRlM1ChwBSVlufpcRi2TkuEKWyc7VJ1eQrwcwJ3ZALTZCdv3HVoDMSG3aIYvIgfwoIIZAbO4VsZAO3vBgLU405ZA1VaoH2gMt1SJXOr6aRcZBuxbV26QpoZA0Rf5448lJI5J81pYefHB8IuzkGfIVXCPQZADZAjKu9YCelGZCEABIEcpu560FHZC6u6RnZADpr4SZBCll9sHVjQIEnpZCMCKww44xCTFH4H33ci4mkBqBQzhZBOH3jS3rqQGKwqAuSPhMH4ewHHi3JZBg9ItHXSsujd3xvFwNJLU0EP7z9DgZD';

async function testMetaToken() {
  console.log('🔍 Inspecting Meta WhatsApp Access Token...');

  try {
    // 1. Get Me profile
    const meRes = await fetch(`https://graph.facebook.com/v20.0/me?access_token=${TOKEN}`);
    const meData = await meRes.json();
    console.log('📱 Meta Profile (Me):', meData);

    // 2. Get WhatsApp Business Accounts
    const wabaRes = await fetch(`https://graph.facebook.com/v20.0/me/businesses?access_token=${TOKEN}`);
    const wabaData = await wabaRes.json();
    console.log('🏢 Businesses:', wabaData);

    // 3. Get Phone numbers if any
    const phoneRes = await fetch(`https://graph.facebook.com/v20.0/me/phone_numbers?access_token=${TOKEN}`);
    const phoneData = await phoneRes.json();
    console.log('📞 Phone Numbers:', phoneData);

  } catch (error: any) {
    console.error('Error inspecting token:', error.message);
  }
}

testMetaToken();
