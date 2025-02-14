# Receipt App

This project is a receipt management application built with React, TypeScript, and Axios for the client-side, and Node.js with Express for the server-side. The application allows users to add and manage receipts, which are stored in a JSON file on the server.

## Project Structure

```
receipt-app
├── client                # Client-side application
│   ├── src               # Source files for the React app
│   │   ├── components     # React components
│   │   ├── services       # API service for Axios calls
│   │   ├── types          # TypeScript types
│   │   ├── App.tsx        # Main application component
│   │   ├── index.tsx      # Entry point for the React app
│   ├── package.json       # Client-side dependencies and scripts
│   ├── tsconfig.json      # TypeScript configuration for client
│   └── README.md          # Documentation for the client-side app
├── server                # Server-side application
│   ├── src               # Source files for the server
│   │   ├── index.ts       # Entry point for the server app
│   │   └── receipts.json   # JSON file to store receipt data
│   ├── package.json       # Server-side dependencies and scripts
│   ├── tsconfig.json      # TypeScript configuration for server
│   └── README.md          # Documentation for the server-side app
├── package.json           # Overall project dependencies and scripts
└── README.md              # Documentation for the entire project
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd receipt-app
   ```

2. Install dependencies for both client and server:
   ```
   cd client
   npm install
   cd ../server
   npm install
   ```

### Running the Application

1. Start the server:
   ```
   cd server
   npm start
   ```

2. In a new terminal, start the client:
   ```
   cd client
   npm start
   ```

### Usage

- Navigate to `http://localhost:3000` in your web browser to access the application.
- Use the form to add new receipts, which will be stored on the server.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.