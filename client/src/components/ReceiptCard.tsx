import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReceiptEditor from "./ReceiptEditor";
import './ReceiptCard.css';

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

interface ReceiptCardProps {
  receipt: Receipt;
  onUpdate: (updatedReceipt: Receipt) => void;
  onDelete: (receiptId: string) => void;
  fetchReceipts: () => void; // Add fetchReceipts prop
  isSelectionMode: boolean; // Add isSelectionMode prop
  isSelected: boolean; // Add isSelected prop
  onSelect: (receiptId: string) => void; // Add onSelect prop
}

const ReceiptCard: React.FC<ReceiptCardProps & { className?: string }> = ({ receipt, onUpdate, onDelete, fetchReceipts, className, isSelectionMode, isSelected, onSelect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleSave = (updatedReceipt: Receipt) => {
    onUpdate(updatedReceipt);
    setIsEditing(false);
    fetchReceipts(); // Fetch receipts after saving
  };

  const handleDelete = () => {
    onDelete(receipt.id);
    fetchReceipts(); // Fetch receipts after deleting
  };

  return (
    <>
      {isEditing ? (
        <ReceiptEditor receipt={receipt} onSave={handleSave} onCancel={() => setIsEditing(false)} onDelete={handleDelete} fetchReceipts={fetchReceipts} className={className} />
      ) : (
        <div id={`receipt-${receipt.id}`} className={`receipt-card ${className} ${isSelected ? 'selected' : ''}`} onClick={() => isSelectionMode ? onSelect(receipt.id) : setIsEditing(true)}><div className="customer-info">
            <p>Name: {receipt.customerName}</p>
            <p>Address: {receipt.customerAddress}</p>
            <div className="location-info">
              <p>{receipt.district}</p>
              <p>-{receipt.city}</p>
            </div>
          </div>
          <h3 className="invoice-number">Invoice #{receipt.id}</h3>
          <hr className="dotted-line" />
          <div className="services-list">
            {receipt.services && receipt.services.map((service, index) => (
              <div key={index} className="service-row">
                  <span className="service-description">{service.description}</span>
                <span className="service-amount">{service.amount.toFixed(2)}€</span>
              </div>
            ))}
          </div>
          <hr className="dotted-line" />
          <div className="amount-row">
            <span className="amount-label">Without Tax:</span>
            <span className="amount-value">{receipt.amountWithoutTax?.toFixed(2) || '0.00'}€</span>
          </div>
          <hr className="dotted-line" />
          <div className="amount-row">
            <span className="amount-label">Tax:</span>
            <span className="amount-value">{receipt.taxRate}%</span>
          </div>
          <hr className="dotted-line" />
          <div className="amount-row">
            <span className="amount-label">With Tax:</span>
            <span className="amount-value">{receipt.amountWithTax?.toFixed(2) || '0.00'}€</span>
          </div>
          <div className="dates">
            <p>Date: {receipt.date}</p>
            <p>Service Period: {receipt.servicePeriod}</p>
          </div>
        </div>
    )}
  </>
  );
};

export default ReceiptCard;