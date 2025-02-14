import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const addReceipt = async (title: string, amount: number, date: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/receipts`, { title, amount, date });
    return response.data;
  } catch (error: any) {
    throw new Error('Error adding receipt: ' + error.message);
  }
};

export const getReceipts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/receipts`);
    return response.data;
  } catch (error: any) {
    throw new Error('Error fetching receipts: ' + error.message);
  }
};

export const updateReceipt = async (id: number, title: string, amount: number, date: string) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/receipts/${id}`, { title, amount, date });
    return response.data;
  } catch (error: any) {
    throw new Error('Error updating receipt: ' + error.message);
  }
};

export const deleteReceipt = async (id: number) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/receipts/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error('Error deleting receipt: ' + error.message);
  }
};