export interface Receipt {
    id: string;
    date: string;
    invoiceNumber: string;
    servicePeriod: string;
    services: { description: string; amount: number }[];
    taxRate: number;
    amountWithoutTax: number;
    amountWithTax: number;
    customerName: string;
    customerAddress: string;
    district: string;
    city: string;
}