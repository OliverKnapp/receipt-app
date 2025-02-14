"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
const receiptsFilePath = path_1.default.join(__dirname, 'receipts.json');
let receipts = [];
let currentId = 1;
// Load receipts from file
const loadReceipts = () => {
    if (fs_1.default.existsSync(receiptsFilePath)) {
        const data = fs_1.default.readFileSync(receiptsFilePath, 'utf-8');
        receipts = JSON.parse(data);
        if (receipts.length > 0) {
            currentId = receipts[receipts.length - 1].id + 1;
        }
    }
};
// Save receipts to file
const saveReceipts = () => {
    fs_1.default.writeFileSync(receiptsFilePath, JSON.stringify(receipts, null, 2));
};
// Load receipts when the server starts
loadReceipts();
// Get all receipts
app.get('/api/receipts', (req, res) => {
    res.json(receipts);
});
// Add a new receipt
app.post('/api/receipts', (req, res) => {
    const { products, amount, date, customer, invoiceNumber, servicePeriod, services, taxRate, amountWithoutTax, amountWithTax, customerName, customerAddress, district, city } = req.body;
    const newReceipt = { id: currentId++, products, amount, date, customer, invoiceNumber, servicePeriod, services, taxRate, amountWithoutTax, amountWithTax, customerName, customerAddress, district, city };
    receipts.push(newReceipt);
    saveReceipts();
    res.status(201).json(newReceipt);
});
// Update a receipt
app.put('/api/receipts/:id', (req, res) => {
    const { id } = req.params;
    const { products, amount, date, customer } = req.body;
    const receiptIndex = receipts.findIndex(receipt => receipt.id === parseInt(id));
    if (receiptIndex !== -1) {
        receipts[receiptIndex] = { id: parseInt(id), products, amount, date, customer };
        saveReceipts();
        res.json(receipts[receiptIndex]);
    }
    else {
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
    }
    else {
        res.status(404).json({ message: 'Receipt not found' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
