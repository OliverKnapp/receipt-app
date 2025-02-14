# Receipt App Server

This is the server-side application for the Receipt App, which handles the storage and management of receipt information.

## Getting Started

To get started with the server, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd receipt-app/server
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the server**:
   ```
   npm start
   ```

The server will start on `http://localhost:5000` (or the port specified in your configuration).

## API Endpoints

### Add Receipt

- **POST** `/api/receipts`
  
  This endpoint allows you to add a new receipt. The request body should contain the receipt information in JSON format.

### Get Receipts

- **GET** `/api/receipts`
  
  This endpoint retrieves all stored receipts.

## File Structure

- `src/index.ts`: Entry point for the server application.
- `src/receipts.json`: JSON file that stores receipt data.

## Dependencies

The server uses the following dependencies:

- Express: A web framework for Node.js.
- TypeScript: A superset of JavaScript that adds static types.

## License

This project is licensed under the MIT License. See the LICENSE file for details.