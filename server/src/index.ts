import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

interface Product {
  name: string;
  price: number;
}

interface Receipt {
  id: number;
  products: Product[];
  amount: number;
  date: string;
  customer: string;
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

const receiptsFilePath = path.join(__dirname, 'receipts.json');
let receipts: Receipt[] = [];
let currentId = 1;

// Load receipts from file
const loadReceipts = () => {
  if (fs.existsSync(receiptsFilePath)) {
    const data = fs.readFileSync(receiptsFilePath, 'utf-8');
    receipts = JSON.parse(data);
    if (receipts.length > 0) {
      currentId = receipts[receipts.length - 1].id + 1;
    }
  }
};

// Save receipts to file
const saveReceipts = () => {
  fs.writeFileSync(receiptsFilePath, JSON.stringify(receipts, null, 2));
};

// Load receipts when the server starts
loadReceipts();

// Get all receipts
app.get('/api/receipts', (req, res) => {
  res.json(receipts);
});

// Add a new receipt
app.post('/api/receipts', (req, res) => {
  const { products, amount, date, customer, servicePeriod, services, taxRate, amountWithoutTax, amountWithTax, customerName, customerAddress, district, city } = req.body;
  const newReceipt: Receipt = { 
    id: currentId, 
    products, 
    amount, 
    date, 
    customer, 
    invoiceNumber: `INV-${currentId}`, // Automatically generate invoiceNumber
    servicePeriod, 
    services, 
    taxRate, 
    amountWithoutTax, 
    amountWithTax, 
    customerName, 
    customerAddress, 
    district, 
    city 
  };
  receipts.push(newReceipt);
  saveReceipts();
  res.status(201).json(newReceipt);
  currentId++; // Increment currentId after saving the receipt
});

// Update a receipt
app.put('/api/receipts/:id', (req, res) => {
  const { id } = req.params;
  const { products, amount, date, customer, servicePeriod, services, taxRate, amountWithoutTax, amountWithTax, customerName, customerAddress, district, city } = req.body;
  const receiptIndex = receipts.findIndex(receipt => receipt.id === parseInt(id));
  if (receiptIndex !== -1) {
    receipts[receiptIndex] = { 
      id: parseInt(id), 
      products, 
      amount, 
      date, 
      customer, 
      invoiceNumber: `INV-${id}`, // Ensure invoiceNumber is updated correctly
      servicePeriod, 
      services, 
      taxRate, 
      amountWithoutTax, 
      amountWithTax, 
      customerName, 
      customerAddress, 
      district, 
      city 
    };
    saveReceipts();
    res.json(receipts[receiptIndex]);
  } else {
    res.status(404).json({ message: 'Receipt not found' });
  }
});

// Delete a receipt
app.delete('/api/receipts/:id', (req, res) => {
  const { id } = req.params;
  const receiptIndex = receipts.findIndex(receipt => receipt.id === parseInt(id));
  if (receiptIndex !== -1) {
    const deletedReceipt = receipts.splice(receiptIndex, 1);
    saveReceipts();
    res.json(deletedReceipt[0]);
  } else {
    res.status(404).json({ message: 'Receipt not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});