import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReceiptCard from "./ReceiptCard";

interface Service {
  description: string;
  amount: number;
}

interface Receipt {
  id: string;
  date: string;
  servicePeriod: string;
  services: Service[];
  taxRate: number;
  amountWithoutTax: number;
  amountWithTax: number;
  customerName: string;
  customerAddress: string;
  district: string;
  city: string;
}

const ReceiptPage: React.FC = () => {
  const { yearMonth = "" } = useParams<{ yearMonth: string }>();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);

  useEffect(() => {
    fetchReceipts();
  }, [yearMonth]);

  const fetchReceipts = async () => {
    const response = await axios.get("http://localhost:5000/api/receipts");
    const filteredReceipts = response.data.filter((receipt: Receipt) =>
      receipt.date.startsWith(yearMonth)
    );
    setReceipts(filteredReceipts);
  };

  const handleUpdate = (updatedReceipt: Receipt) => {
    setReceipts((prevReceipts) =>
      prevReceipts.map((receipt) =>
        receipt.id === updatedReceipt.id ? updatedReceipt : receipt
      )
    );
    fetchReceipts(); // Fetch receipts after updating
  };

  const handleDelete = async (receiptId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/receipts/${receiptId}`);
      setReceipts((prevReceipts) =>
        prevReceipts.filter((receipt) => receipt.id !== receiptId)
      );
      fetchReceipts(); // Fetch receipts after deleting
    } catch (error) {
      console.error("Error deleting receipt:", error);
    }
  };

  const handleReceiptSelect = (receiptId: string) => {
    setSelectedReceipts((prev) =>
      prev.includes(receiptId)
        ? prev.filter((id) => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  return (
    <div className="receipt-page">
      <h1>Receipts for {yearMonth}</h1>
      <div className="receipt-card-container">
        {receipts.map((receipt) => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            fetchReceipts={fetchReceipts}
            isSelectionMode={isSelectionMode}
            isSelected={selectedReceipts.includes(receipt.id)}
            onSelect={handleReceiptSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default ReceiptPage;