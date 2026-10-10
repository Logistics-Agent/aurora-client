import { api } from "@/lib/api";

export type InvoiceLineItemDto = {
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  category: string;
};

export type InvoiceDto = {
  id: string;
  invoiceNumber: string;
  shipmentId: string;
  customerId: string;
  totalAmount: number;
  currency: string;
  status: string;
  dueDate: string;
  issuedAt: string;
  items?: InvoiceLineItemDto[];
};

export type ListInvoicesResponse = {
  invoices: InvoiceDto[];
  totalCount: number;
  page: number;
  limit: number;
};

export type CreditCheckResponse = {
  isApproved: boolean;
  creditLimit: number;
  currentExposure: number;
  availableCredit: number;
  reason?: string;
};

export type WalletBalanceResponse = {
  walletId: string;
  tenantId: string;
  currency: string;
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
};

export const billingService = {
  listInvoices: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ListInvoicesResponse> => {
    return api.get("/api/v1/invoices", { params });
  },

  getInvoice: async (id: string): Promise<InvoiceDto> => {
    return api.get(`/api/v1/invoices/${id}`);
  },

  generateInvoice: async (payload: {
    shipmentId: string;
    customerId: string;
    paymentTermsDays?: number;
  }): Promise<InvoiceDto> => {
    return api.post("/api/v1/invoices/generate", payload);
  },

  createInvoice: async (payload: {
    shipmentId: string;
    customerId: string;
    dueDate: string;
    items: InvoiceLineItemDto[];
  }): Promise<InvoiceDto> => {
    return api.post("/api/v1/invoices", payload);
  },

  updateInvoiceStatus: async (
    id: string,
    status: string,
  ): Promise<InvoiceDto> => {
    return api.patch(`/api/v1/invoices/${id}/status`, { status });
  },

  checkCustomerCredit: async (payload: {
    customerId: string;
    newAmount: number;
  }): Promise<CreditCheckResponse> => {
    return api.post("/api/v1/billing/credit-check", payload);
  },

  getWalletBalance: async (walletId: string): Promise<WalletBalanceResponse> => {
    return api.get(`/api/v1/escrow/wallets/${walletId}`);
  },
};

