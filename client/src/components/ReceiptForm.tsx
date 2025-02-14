import React, { useState } from 'react';
import axios from 'axios';

const ReceiptForm: React.FC = () => {
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const receiptData = { date, amount, description };

        try {
            await axios.post('http://localhost:5000/api/receipts', receiptData);
            // Clear the form fields after submission
            setDate('');
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error('Error adding receipt:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Date:</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Amount:</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Description:</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Add Receipt</button>
        </form>
    );
};

export default ReceiptForm;