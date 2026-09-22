import fs from 'node:fs';
import path from 'node:path';

export interface CardOnFile {
  id: string;
  patientId: string;
  cardBrand: 'Visa' | 'Mastercard' | 'Amex' | 'Discover';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  stripePaymentMethodId: string;
  cardholderName: string;
  addedAtIso: string;
}

export interface CopayTransaction {
  transactionId: string;
  patientId: string;
  treatmentName: string;
  amount: number;
  currency: 'USD';
  status: 'pre_authorized' | 'captured' | 'refunded';
  cardUsed: {
    brand: string;
    last4: string;
  };
  authCode: string;
  receiptNumber: string;
  timestampIso: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PAYMENTS_STORE_FILE = path.join(DATA_DIR, 'patient_copays_store.json');

export class CopayPaymentService {
  private static instance: CopayPaymentService;
  private cardsMap: Map<string, CardOnFile[]> = new Map();
  private transactions: CopayTransaction[] = [];

  private constructor() {
    this.ensureDataDir();
    this.loadData();
  }

  public static getInstance(): CopayPaymentService {
    if (!CopayPaymentService.instance) {
      CopayPaymentService.instance = new CopayPaymentService();
    }
    return CopayPaymentService.instance;
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(PAYMENTS_STORE_FILE)) {
        const raw = fs.readFileSync(PAYMENTS_STORE_FILE, 'utf8');
        const data = JSON.parse(raw);
        if (data.cards) {
          for (const [k, v] of Object.entries(data.cards)) {
            this.cardsMap.set(k, v as CardOnFile[]);
          }
        }
        if (data.transactions) {
          this.transactions = data.transactions;
        }
        return;
      }
    } catch (err) {
      console.warn('[CopayPaymentService] Initializing copay payments store.');
    }

    // Seed sample card on file for Sophia Martinez
    const seedCard: CardOnFile = {
      id: 'card-seed-01',
      patientId: 'pat-seed-01',
      cardBrand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2028,
      isDefault: true,
      stripePaymentMethodId: 'pm_1N4seed998412_mock',
      cardholderName: 'Sophia Martinez',
      addedAtIso: '2026-08-01T10:00:00.000Z',
    };
    this.cardsMap.set(seedCard.patientId, [seedCard]);
    this.saveData();
  }

  private saveData(): void {
    try {
      const cardsObj: Record<string, CardOnFile[]> = {};
      for (const [k, v] of this.cardsMap.entries()) {
        cardsObj[k] = v;
      }
      fs.writeFileSync(
        PAYMENTS_STORE_FILE,
        JSON.stringify({ cards: cardsObj, transactions: this.transactions }, null, 2),
        'utf8'
      );
    } catch (err) {
      console.error('[CopayPaymentService] Failed saving copay store:', err);
    }
  }

  public getCardsForPatient(patientId: string): CardOnFile[] {
    return this.cardsMap.get(patientId) || [];
  }

  public saveCardOnFile(card: Omit<CardOnFile, 'id' | 'addedAtIso'>): CardOnFile {
    const full: CardOnFile = {
      ...card,
      id: `card-${Date.now()}`,
      addedAtIso: new Date().toISOString(),
    };
    const existing = this.cardsMap.get(card.patientId) || [];
    existing.push(full);
    this.cardsMap.set(card.patientId, existing);
    this.saveData();
    return full;
  }

  /**
   * Pre-authorizes copay on card-on-file for 1-click checkout
   */
  public preAuthorizeCopay(params: {
    patientId: string;
    treatmentName: string;
    amount: number;
    cardId?: string;
  }): CopayTransaction {
    const cards = this.getCardsForPatient(params.patientId);
    const selectedCard = cards.find((c) => c.id === params.cardId) || cards[0] || {
      cardBrand: 'Visa',
      last4: '4242',
    };

    const txn: CopayTransaction = {
      transactionId: `txn-${Date.now()}`,
      patientId: params.patientId,
      treatmentName: params.treatmentName,
      amount: params.amount,
      currency: 'USD',
      status: 'pre_authorized',
      cardUsed: {
        brand: selectedCard.cardBrand,
        last4: selectedCard.last4,
      },
      authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      receiptNumber: `RCP-${Date.now().toString().slice(-6)}`,
      timestampIso: new Date().toISOString(),
    };

    this.transactions.unshift(txn);
    this.saveData();
    return txn;
  }

  public getTransactionsForPatient(patientId: string): CopayTransaction[] {
    return this.transactions.filter((t) => t.patientId === patientId);
  }
}

export const copayPaymentService = CopayPaymentService.getInstance();
