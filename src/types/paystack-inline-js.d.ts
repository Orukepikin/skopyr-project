declare module '@paystack/inline-js' {
  interface PaystackTransactionCallbacks {
    onCancel?: () => void;
    onError?: (error: { message: string }) => void;
    onLoad?: (response: { id: number; accessCode: string; customer: unknown }) => void;
    onSuccess?: (response: { id: number; message: string; reference: string }) => void;
  }

  interface PaystackTransactionOptions extends PaystackTransactionCallbacks {
    amount: number;
    channels?: string[];
    currency?: string;
    email: string;
    firstName?: string;
    key: string;
    lastName?: string;
    metadata?: Record<string, unknown>;
    phone?: string;
    reference?: string;
  }

  export default class PaystackPop {
    checkout(options: PaystackTransactionOptions): Promise<unknown>;
    newTransaction(options: PaystackTransactionOptions): unknown;
    resumeTransaction(accessCode: string, callbacks?: PaystackTransactionCallbacks): unknown;
  }
}
