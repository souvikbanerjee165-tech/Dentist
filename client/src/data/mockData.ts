import { Conversation, DocumentItem, Lead, KPIStats } from '../types';

export const initialKPIs: KPIStats = {
  todayMessages: 142,
  todayMessagesDelta: 18.4,
  newLeads: 28,
  newLeadsDelta: 12.5,
  appointments: 9,
  appointmentsDelta: 25.0,
  revenueEstimate: 6450,
  revenueEstimateDelta: 15.2,
  humanTakeovers: 2,
  humanTakeoversDelta: -33.3,
  conversationSuccessRate: 94.2,
  conversationSuccessDelta: 3.1,
};

export const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    fullName: 'Sophia Martinez',
    phoneNumber: '+1 (555) 234-5678',
    email: 'sophia.m@example.com',
    status: 'booked',
    customData: {
      'Requested Service': 'Teeth Whitening & Clean',
      'Preferred Date': 'Friday 3:00 PM',
      'Insurance': 'MetLife Dental',
      'Estimated Value': '$350',
    },
    lastInteraction: '10m ago',
    source: 'WhatsApp Organic',
    notes: 'Confirmed slot for Friday 3:00 PM via Google Calendar integration.',
  },
  {
    id: 'lead-2',
    fullName: 'David Chen',
    phoneNumber: '+1 (555) 876-5432',
    email: 'dchen@techcorp.io',
    status: 'qualified',
    customData: {
      'Budget': '$15,000 / mo',
      'Service': 'Growth Marketing Retainer',
      'Company Size': '25-50',
    },
    lastInteraction: '24m ago',
    source: 'Instagram Ad -> WhatsApp',
    notes: 'High intent prospect, asked for case studies on B2B SaaS lead gen.',
  },
  {
    id: 'lead-3',
    fullName: 'Elena Rostova',
    phoneNumber: '+1 (555) 345-9876',
    email: 'elena.rostova@gmail.com',
    status: 'new',
    customData: {
      'Goal': 'Personal Training & Nutrition',
      'Availability': 'Mornings 7 AM',
      'Health Conditions': 'Lower back injury rehab',
    },
    lastInteraction: '1h ago',
    source: 'Website Click to WhatsApp',
    notes: 'Triggered Human Handover: asked medical clearance question.',
  },
  {
    id: 'lead-4',
    fullName: 'Marcus Sterling',
    phoneNumber: '+1 (555) 901-2345',
    email: 'marcus@sterlingrealty.com',
    status: 'booked',
    customData: {
      'Property Type': '3-Bedroom Luxury Penthouse',
      'Location': 'Downtown Waterfront',
      'Budget': '$1.2M - $1.5M',
    },
    lastInteraction: '3h ago',
    source: 'Listing QR Code',
    notes: 'Showing tour booked for Saturday 11:30 AM.',
  },
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    lead: initialLeads[0],
    status: 'ai_active',
    lastMessage: 'Your appointment is confirmed for Friday at 3:00 PM with Dr. Reynolds! 🎉',
    lastMessageTime: '10m ago',
    unreadCount: 0,
    lastConfidenceScore: 0.98,
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderType: 'user',
        content: 'Hi! Do you have any openings for teeth whitening this Friday afternoon?',
        timestamp: '10:14 AM',
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderType: 'ai',
        content: 'Hello Sophia! 👋 Yes, Dr. Reynolds has an opening this Friday at 3:00 PM for our Laser Whitening & Deep Clean package ($350). Would that time work for you?',
        timestamp: '10:14 AM',
        confidenceScore: 0.97,
        toolsUsed: ['search_knowledge_base', 'check_calendar_availability'],
      },
      {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderType: 'user',
        content: 'Yes Friday at 3 PM is perfect! Please book it for Sophia Martinez, my email is sophia.m@example.com',
        timestamp: '10:16 AM',
      },
      {
        id: 'msg-4',
        conversationId: 'conv-1',
        senderType: 'ai',
        content: 'Your appointment is confirmed for Friday at 3:00 PM with Dr. Reynolds! 🎉 A Google Calendar invite has been sent to sophia.m@example.com. See you then!',
        timestamp: '10:16 AM',
        confidenceScore: 0.99,
        toolsUsed: ['book_appointment', 'update_lead_profile'],
      },
    ],
  },
  {
    id: 'conv-2',
    lead: initialLeads[2],
    status: 'human_takeover',
    lastMessage: 'Let me connect you directly with Dr. Reynolds to review your back injury history.',
    lastMessageTime: '1h ago',
    unreadCount: 1,
    lastConfidenceScore: 0.52,
    messages: [
      {
        id: 'msg-201',
        conversationId: 'conv-2',
        senderType: 'user',
        content: 'Hi, I want to sign up for personal training, but I had a herniated L4-L5 disc 4 months ago. Can your trainers design a custom rehab program?',
        timestamp: '9:05 AM',
      },
      {
        id: 'msg-202',
        conversationId: 'conv-2',
        senderType: 'ai',
        content: 'I want to make sure you get the safest guidance for your back. Let me connect you directly with our Head Physical Trainer, Dr. Reynolds, right away.',
        timestamp: '9:05 AM',
        confidenceScore: 0.52,
        toolsUsed: ['request_human_handover'],
      },
    ],
  },
  {
    id: 'conv-3',
    lead: initialLeads[1],
    status: 'ai_active',
    lastMessage: 'Here is our Case Study PDF with 340% ROI for Tech SaaS clients.',
    lastMessageTime: '24m ago',
    unreadCount: 0,
    lastConfidenceScore: 0.94,
    messages: [
      {
        id: 'msg-301',
        conversationId: 'conv-3',
        senderType: 'user',
        content: 'What results have you gotten for B2B software companies in our niche?',
        timestamp: '9:45 AM',
      },
      {
        id: 'msg-302',
        conversationId: 'conv-3',
        senderType: 'ai',
        content: 'Great question David! We recently scaled CloudScale from $20k to $110k MRR in 6 months using our paid acquisition funnel. Would you like a 15-min discovery call with our founder?',
        timestamp: '9:46 AM',
        confidenceScore: 0.94,
        toolsUsed: ['search_knowledge_base'],
      },
    ],
  },
];

export const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    name: '2026_Treatment_Pricing_and_Services.pdf',
    type: 'pricing',
    chunksCount: 18,
    size: '1.2 MB',
    uploadedAt: '2 days ago',
    status: 'indexed',
  },
  {
    id: 'doc-2',
    name: 'Clinic_FAQ_and_Patient_Policies.docx',
    type: 'faq',
    chunksCount: 24,
    size: '450 KB',
    uploadedAt: '3 days ago',
    status: 'indexed',
  },
  {
    id: 'doc-3',
    name: 'Emergency_Triage_and_Escalation_Rules.txt',
    type: 'policy',
    chunksCount: 8,
    size: '85 KB',
    uploadedAt: '1 week ago',
    status: 'indexed',
  },
  {
    id: 'doc-4',
    name: 'Insurance_Coverage_and_Copay_Guide.pdf',
    type: 'services',
    chunksCount: 14,
    size: '890 KB',
    uploadedAt: '1 week ago',
    status: 'indexed',
  },
];

export const initialFAQs = [
  {
    id: 'faq-1',
    question: 'How much is laser teeth whitening and what is included?',
    answer: 'Our Laser Whitening & Deep Clean package is $350. It includes the 45-minute in-office treatment, pre-treatment rinse, and a take-home remineralization kit.',
    category: 'Pricing & Packages',
    updatedAt: 'Yesterday',
  },
  {
    id: 'faq-2',
    question: 'What is your appointment cancellation and rescheduling policy?',
    answer: 'You may cancel or reschedule your appointment up to 24 hours in advance with zero penalty fees. Notice under 24 hours carries a $50 late fee.',
    category: 'Policies & Cancellations',
    updatedAt: '2 days ago',
  },
  {
    id: 'faq-3',
    question: 'Do you accept dental insurance?',
    answer: 'Yes! We accept all major PPO insurance providers including Delta Dental, MetLife, Cigna, Aetna, and Guardian. We file claims directly for you.',
    category: 'Insurance & Payments',
    updatedAt: '1 week ago',
  },
  {
    id: 'faq-4',
    question: 'Where is the clinic located and what are the opening hours?',
    answer: 'We are located at 450 Lexington Avenue, Suite 800, New York, NY. Open Monday - Friday from 8:00 AM - 6:00 PM, and Saturdays from 9:00 AM - 3:00 PM.',
    category: 'Location & Hours',
    updatedAt: '1 week ago',
  },
];

export const initialBusinessProfile = {
  name: 'Apex Care Clinic',
  industry: 'Medical & Dental Clinic',
  phoneNumberId: '109283746592817',
  ownerNotificationPhone: '+1 (555) 987-6543',
  ownerNotificationEmail: 'dr.reynolds@apexdental.com',
  aiAutopilotEnabled: true,
  confidenceThreshold: 70,
  toneOfVoice: 'Warm & Professional',
  systemPrompt: `You are the Senior Sales & Patient Coordinator for Apex Care Clinic on WhatsApp.
Your job is to:
1. Warmly answer patient questions using ONLY verified facts from the Knowledge Base.
2. Check real-time availability and guide patients to book consultations using Google Calendar.
3. Collect their Full Name, Best Phone Number, and Primary Concern.
4. If a question is out of scope or requires medical diagnosis, gracefully escalate to Dr. Reynolds.`,
};
