import React, { useState, useEffect } from "react";
import axios from "axios";
import './ReceiptEditor.css';
import { API_BASE_URL } from '../config';

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

interface ReceiptEditorProps {
  receipt: Receipt;
  onSave: (updatedReceipt: Receipt) => void;
  onCancel: () => void;
  onDelete: (receiptId: string) => void;
  fetchReceipts: () => void; // Add fetchReceipts prop
}

const ReceiptEditor: React.FC<ReceiptEditorProps & { className?: string }> = ({ receipt, onSave, onCancel, onDelete, fetchReceipts, className }) => {
  const [services, setServices] = useState(receipt.services || [{ description: '', amount: 0 }]);
  const [date, setDate] = useState(receipt.date);
  const [servicePeriod, setServicePeriod] = useState(receipt.servicePeriod);
  const [taxRate, setTaxRate] = useState(receipt.taxRate);
  const [amountWithoutTax, setAmountWithoutTax] = useState(receipt.amountWithoutTax);
  const [amountWithTax, setAmountWithTax] = useState(receipt.amountWithTax);
  const [customerName, setCustomerName] = useState(receipt.customerName);
  const [customerAddress, setCustomerAddress] = useState(receipt.customerAddress);
  const [district, setDistrict] = useState(receipt.district);
  const [city, setCity] = useState(receipt.city);

  useEffect(() => {
    const totalAmountWithoutTax = services.reduce((sum, service) => sum + (service.amount || 0), 0);
    setAmountWithoutTax(totalAmountWithoutTax);
    setAmountWithTax(totalAmountWithoutTax * (1 + taxRate / 100));
  }, [services, taxRate]);

  const handleSave = async () => {
    const updatedReceipt = { ...receipt, services, date, servicePeriod, taxRate, amountWithoutTax, amountWithTax, customerName, customerAddress, district, city };
    if (!date) {
      alert("Date is required to save the receipt.");
      return; // Stop further execution if date is missing
    }
    if (receipt.id === '0') {
      // New receipt
      const response = await axios.post(`${API_BASE_URL}/api/receipts`, updatedReceipt);
      onSave(response.data);
    } else {
      // Existing receipt
      await axios.put(`${API_BASE_URL}/api/receipts/${receipt.id}`, updatedReceipt);
      onSave(updatedReceipt);
    }
    fetchReceipts(); // Fetch receipts after saving
  };

  const handleDelete = async () => {
    if (receipt.id !== '0') {
      await axios.delete(`${API_BASE_URL}/api/receipts/${receipt.id}`);
      onDelete(receipt.id);
    }
    fetchReceipts(); // Fetch receipts after deleting
  };

  const handleAddService = () => {
    setServices([...services, { description: '', amount: 0 }]);
  };

  const handleServiceChange = (index: number, field: keyof Service, value: string | number) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
  };

  return (
    <div className={`receipt-editor ${className}`}>
      <h3>{receipt.id === '0' ? "Add New Receipt" : `Edit Receipt #${receipt.id}`}</h3>
      <div className="editor-grid">
        <div className="customer-info">
          <label>
            Customer Name:
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </label>
          <label>
            Customer Address:
            <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
          </label>
          <label>
            District:
            <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} />
          </label>
          <label>
            City:
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
        </div>
        <div className="prices-info">
          {services.map((service, index) => (
            <div key={index} className="service-row">
              <span className="service-number">{index + 1}.</span>
              <label>
                Description:
                <input
                  type="text"
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                />
              </label>
              <label>
                Amount:
                <input
                  type="number"
                  value={service.amount || ''}
                  onChange={(e) => handleServiceChange(index, 'amount', parseFloat(e.target.value) || 0)}
                />
              </label>
            </div>
          ))}
          <button onClick={handleAddService}>Add Service</button>
          <label>
            Tax Rate:
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
          </label>
          <label>
            Amount Without Tax:
            <input type="number" value={amountWithoutTax || 0} readOnly />
          </label>
          <label>
            Amount With Tax:
            <input type="number" value={amountWithTax || 0} readOnly />
          </label>
        </div>
        <div className="receipt-info">
          <label>
            Date:
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Service Period:
            <input type="month" value={servicePeriod} onChange={(e) => setServicePeriod(e.target.value)} />
          </label>
        </div>
      </div>
      <div className="editor-buttons">
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
        {receipt.id !== '0' && <button onClick={handleDelete}>Delete</button>}
      </div>
    </div>
  );
};

export default ReceiptEditor;