/**
 * High-Conversion Patient Coordinator Brain
 * Short, punchy, conversational, and always ends with an actionable next step.
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
  static generateResponse(userMessage: string, history: ChatMessageContext[]): GeminiHumanResponse {
    const raw = userMessage.trim();
    const msg = raw.toLowerCase();

    // Check past history for contextual memory
    const historyText = history.map((h) => h.text.toLowerCase()).join(' ');
    const previousToothPain = historyText.includes('pain') || historyText.includes('toothache') || historyText.includes('hurts');
    const hasMentionedDays = historyText.includes('days') || msg.includes('days') || msg.includes('week');

    // 1. Medication & Antibiotics (Azithromycin, Painkillers, etc.)
    if (
      msg.includes('medicine') ||
      msg.includes('azithromycin') ||
      msg.includes('amoxicillin') ||
      msg.includes('antibiotic') ||
      msg.includes('painkiller') ||
      msg.includes('pain killer') ||
      msg.includes('ibuprofen') ||
      msg.includes('on my own') ||
      msg.includes('pill')
    ) {
      return {
        intent: 'medication_safety',
        confidence: 0.99,
        reply: `It's best not to take antibiotics like Azithromycin without an examination. Antibiotics can temporarily reduce symptoms, but they won't treat the underlying tooth infection.

Dr. Sarah Jensen has an urgent relief slot open today.

**Would you like me to reserve that slot for you?**`,
      };
    }

    // 2. Tooth Pain & Dental Discomfort (Context-Aware Memory)
    if (
      msg.includes('pain') ||
      msg.includes('toothache') ||
      msg.includes('teeth pains') ||
      msg.includes('hurts') ||
      msg.includes('sensitive') ||
      msg.includes('swollen') ||
      msg.includes('bleeding')
    ) {
      if (hasMentionedDays || previousToothPain) {
        return {
          intent: 'urgent_pain_relief',
          confidence: 0.99,
          reply: `I understand. Since the pain has been persisting, is it worse when drinking cold liquids or chewing?

Leaving it unexamined can allow the nerve inflammation to escalate into a deeper infection. Dr. Sarah Jensen has an opening this afternoon to relieve the pain immediately.

**Should I secure this priority exam slot for you today?**`,
        };
      }

      return {
        intent: 'urgent_pain_relief',
        confidence: 0.99,
        reply: `I'm sorry you're in pain! Tooth pain is usually a sign of nerve irritation or enamel decay that needs prompt attention before it worsens.

Dr. Sarah Jensen has a priority relief opening today.

**Would you like me to hold that appointment for you? What is your full name?**`,
      };
    }

    // 3. Whitening & Cosmetic Packages
    if (
      msg.includes('whitening') ||
      msg.includes('brighten') ||
      msg.includes('stain') ||
      msg.includes('cost') ||
      msg.includes('price') ||
      msg.includes('package')
    ) {
      return {
        intent: 'cosmetic_whitening',
        confidence: 0.98,
        reply: `Our Laser Whitening & Deep Clean package is **$350**. It brightens teeth up to 8 shades in 45 minutes with zero tooth sensitivity, and includes a take-home touch-up kit.

We have openings this **Friday at 3:00 PM** and **Saturday at 11:00 AM**.

**Which day works best for your schedule?**`,
      };
    }

    // 4. Booking & Scheduling Requests
    if (
      msg.includes('book') ||
      msg.includes('appointment') ||
      msg.includes('schedule') ||
      msg.includes('friday') ||
      msg.includes('tomorrow') ||
      msg.includes('today') ||
      msg.includes('slot')
    ) {
      const isSophia = msg.includes('sophia');
      return {
        intent: 'appointment_booking',
        confidence: 0.99,
        reply: `${isSophia ? 'Perfect, Sophia!' : 'Great!'} I have held Friday at 3:00 PM with Dr. Sarah Jensen.

**What is the best WhatsApp phone number to send your instant confirmation to?**`,
      };
    }

    // 5. Insurance & Payments
    if (
      msg.includes('insurance') ||
      msg.includes('metlife') ||
      msg.includes('delta') ||
      msg.includes('cigna') ||
      msg.includes('aetna') ||
      msg.includes('ppo')
    ) {
      return {
        intent: 'insurance_pricing',
        confidence: 0.97,
        reply: `Yes! We accept and file claims directly with all major PPO insurances including Delta Dental, MetLife, Cigna, and Aetna for zero paperwork on your end.

We also offer 0% interest monthly payment plans.

**Would you like to book a consultation so we can verify your exact benefits?**`,
      };
    }

    // 6. Sign-Up Assistance
    if (msg.includes('sign up') || msg.includes('register') || msg.includes('form') || msg.includes('help')) {
      return {
        intent: 'signup_support',
        confidence: 0.98,
        reply: `I can help you sign up right here in 30 seconds! 

All we need is your Full Name, Phone Number, and what treatment you need.

**What is your full name and what dental concern can we help you with?**`,
      };
    }

    // 7. General Greetings
    return {
      intent: 'greeting',
      confidence: 0.95,
      reply: `Hello and welcome to Dr. Sarah Jensen's clinic! 😊

I can help you book same-day pain relief, check treatment pricing, or answer questions about insurance.

**Are you looking to book an appointment or check a specific treatment today?**`,
    };
  }
}
