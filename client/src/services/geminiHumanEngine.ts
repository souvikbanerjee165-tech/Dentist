/**
 * Google Gemini-Grade Human Conversational Intelligence Engine
 * Emulates a real, highly articulate, empathetic Patient Care Coordinator for Dr. Sarah Jensen, DDS
 */

export interface ChatMessageContext {
  sender: 'user' | 'gemini';
  text: string;
}

export interface GeminiHumanResponse {
  reply: string;
  intent: string;
  confidence: number;
}

export class GeminiHumanEngine {
  /**
   * Generates a rich, human-grade conversational response
   */
  static generateResponse(userMessage: string, history: ChatMessageContext[]): GeminiHumanResponse {
    const raw = userMessage.trim();
    const msg = raw.toLowerCase();

    // 1. Tooth Pain / Dental Discomfort / Emergencies
    if (
      msg.includes('pain') ||
      msg.includes('toothache') ||
      msg.includes('teeth pains') ||
      msg.includes('hurts') ||
      msg.includes('swollen') ||
      msg.includes('sensitive') ||
      msg.includes('bleeding') ||
      msg.includes('cavity') ||
      msg.includes('broken tooth') ||
      msg.includes('root canal')
    ) {
      const isColdOrHot = msg.includes('cold') || msg.includes('hot') || msg.includes('sweet');
      const isSevere = msg.includes('severe') || msg.includes('bad') || msg.includes('can\'t sleep') || msg.includes('unbearable');

      return {
        intent: 'urgent_pain_relief',
        confidence: 0.99,
        reply: `I'm truly sorry you're dealing with that discomfort. Tooth pain is one of the most frustrating things to experience, and it's almost always your tooth's nerve signaling that something needs attention—whether it's deep enamel decay, a micro-crack, or inflammation beneath the surface.

The most important thing to know is that dental pain rarely resolves on its own; without treatment, localized inflammation can progress deeper into the root canal or surrounding bone. The good news is that early intervention is quick, gentle, and saves your natural tooth before it requires more extensive work.

Dr. Sarah Jensen keeps dedicated emergency slots open every day for patients experiencing pain so you don't have to wait. We can perform a gentle 3D digital scan to pinpoint the exact cause in minutes and give you immediate relief.

Would you like me to hold our next priority opening today for you? If so, what's your full name and the best phone number to reach you?`,
      };
    }

    // 2. Medication / Antibiotics / Self-Treatment (Azithromycin, Painkillers, Ibuprofen)
    if (
      msg.includes('medicine') ||
      msg.includes('azithromycin') ||
      msg.includes('amoxicillin') ||
      msg.includes('antibiotic') ||
      msg.includes('painkiller') ||
      msg.includes('pain killer') ||
      msg.includes('ibuprofen') ||
      msg.includes('paracetamol') ||
      msg.includes('tylenol') ||
      msg.includes('advil') ||
      msg.includes('on my own') ||
      msg.includes('pill')
    ) {
      const mentionsAzithro = msg.includes('azithromycin') || msg.includes('amoxicillin');

      return {
        intent: 'medication_safety',
        confidence: 0.99,
        reply: `Please be very careful about taking ${mentionsAzithro ? 'prescription antibiotics like Azithromycin' : 'medications or antibiotics on your own'} without a physical dental examination.

Here is why: Antibiotics and over-the-counter painkillers only temporarily suppress bacteria or dull the nerve sensation—they cannot remove the physical source of infection inside the tooth. Once the pills wear off, the underlying infection usually rebounds even stronger and can spread into the jaw tissue. Furthermore, taking unprescribed antibiotics creates drug resistance and can cause adverse reactions.

Dr. Sarah Jensen needs to examine the tooth with our high-definition 3D imaging to determine whether you need a gentle localized treatment, a protective dressing, or a specific targeted prescription.

We have an urgent consultation slot open today so Dr. Jensen can safely diagnose the root cause and provide proper, lasting relief. Should I go ahead and reserve this priority slot for you today?`,
      };
    }

    // 3. Laser Teeth Whitening Inquiries
    if (
      msg.includes('whitening') ||
      msg.includes('brighten') ||
      msg.includes('yellow') ||
      msg.includes('stain') ||
      msg.includes('bleach')
    ) {
      return {
        intent: 'cosmetic_whitening',
        confidence: 0.98,
        reply: `Our Cosmetic Laser Teeth Whitening is our most popular aesthetic treatment! 

Here is what makes Dr. Jensen's laser protocol special:
• **Dramatic Results**: It lifts deep stubborn coffee, tea, and aging stains by 6 to 8 shades in a single 45-minute appointment.
• **Zero Sensitivity**: We use a specialized gentle remineralizing gel and cool-wavelength laser that prevents the sharp sensitivity common with drugstore kits.
• **Complete Package ($350)**: Includes the full in-office laser treatment, pre-treatment enamel polish, and a custom take-home maintenance touch-up kit.

We have consultation openings this Friday afternoon and Saturday morning. Would you like to secure a time to get your smile brightened?`,
      };
    }

    // 4. Booking / Scheduling Requests
    if (
      msg.includes('book') ||
      msg.includes('appointment') ||
      msg.includes('schedule') ||
      msg.includes('friday') ||
      msg.includes('tomorrow') ||
      msg.includes('today') ||
      msg.includes('time') ||
      msg.includes('slot')
    ) {
      const hasName = msg.includes('my name is') || msg.includes('i am') || msg.includes('sophia');

      return {
        intent: 'appointment_booking',
        confidence: 0.99,
        reply: `I would be delighted to schedule your visit with Dr. Sarah Jensen!

We currently have availability:
1. 🗓️ **Today / Priority Opening**: 3:30 PM
2. 🗓️ **This Friday**: 9:00 AM, 11:30 AM, or 3:00 PM
3. 🗓️ **Saturday**: 10:00 AM or 1:00 PM

${hasName ? 'I have your name noted! Could you also share your preferred WhatsApp phone number so we can confirm the reservation in our calendar and Supabase system?' : 'Which of these times works best for your schedule? Also, please let me know your full name and phone number so I can hold the appointment for you.'}`,
      };
    }

    // 5. Dental Anxiety / Fear / Painless Dentistry
    if (
      msg.includes('scared') ||
      msg.includes('fear') ||
      msg.includes('afraid') ||
      msg.includes('nervous') ||
      msg.includes('anxiety') ||
      msg.includes('hurt') ||
      msg.includes('painful')
    ) {
      return {
        intent: 'anxiety_reassurance',
        confidence: 0.98,
        reply: `I completely understand, and you are definitely not alone—over 60% of our patients felt nervous before their first visit with us!

Dr. Sarah Jensen is widely known for her gentle, empathetic touch. Our clinic is designed like a calm, modern spa:
• We use painless computer-assisted micro-anesthesia (no big scary needles).
• Noise-canceling headphones with your choice of music or streaming.
• We go strictly at your pace—you can pause anytime with a simple hand gesture.

You'll never be judged or rushed here. Would you like to come in for a simple, relaxed consultation just to chat with Dr. Jensen and look around?`,
      };
    }

    // 6. Insurance & Payment / Pricing Inquiries
    if (
      msg.includes('insurance') ||
      msg.includes('metlife') ||
      msg.includes('delta') ||
      msg.includes('cigna') ||
      msg.includes('aetna') ||
      msg.includes('cost') ||
      msg.includes('price') ||
      msg.includes('payment') ||
      msg.includes('financing')
    ) {
      return {
        intent: 'insurance_pricing',
        confidence: 0.97,
        reply: `We believe in 100% transparent pricing with zero surprise bills!

• **PPO Dental Insurance**: We accept and file claims directly with all major PPO insurance providers including Delta Dental, MetLife, Cigna, Aetna, and Guardian.
• **Transparent Fees**:
  - Comprehensive Exam, 3D Imaging & Ultrasonic Cleaning: $180
  - Laser Teeth Whitening & Home Kit: $350
  - Emergency Pain Diagnosis: $95
• **Flexible Payment**: We also offer 0% interest monthly payment plans via CareCredit and Sunbit.

If you have your insurance card handy, you can bring it to your appointment and our front desk will verify your exact coverage benefits for you. Would you like to book a consultation?`,
      };
    }

    // 7. Sign Up & Account Assistance
    if (
      msg.includes('sign up') ||
      msg.includes('register') ||
      msg.includes('account') ||
      msg.includes('form') ||
      msg.includes('intake')
    ) {
      return {
        intent: 'signup_support',
        confidence: 0.98,
        reply: `I can guide you through the registration process right now!

To create your patient profile, you only need:
1. Your Full Name
2. WhatsApp Phone Number
3. Email Address
4. Your Primary Dental Goal (e.g., Pain relief, Whitening, Routine Clean)

You can click the **"Patient Sign Up"** button at the top right of this page, or simply tell me your details here in chat and I will register your profile directly into our Supabase database. How would you like to proceed?`,
      };
    }

    // 8. General Greetings & Conversational Queries
    return {
      intent: 'greeting',
      confidence: 0.95,
      reply: `Hello and welcome to Dr. Sarah Jensen's dental practice! 😊

I'm Dr. Jensen's AI Patient Coordinator, and I'm here to make your dental care effortless. How can I assist you today?

You can ask me about:
• 🚨 **Urgent tooth pain or discomfort** (we have same-day relief slots)
• 💎 **Cosmetic laser teeth whitening or smile makeovers**
• 🦷 **Comprehensive oral exams & cleanings**
• 🛡️ **Insurance coverage & flexible pricing**

What brings you in today?`,
    };
  }
}
