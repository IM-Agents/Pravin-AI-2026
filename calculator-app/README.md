# Simple Calculator

A basic arithmetic calculator built with React.js and Vite.

## Features

- Basic arithmetic operations: addition (+), subtraction (-), multiplication (*), division (/)
- Clear button (C) to reset the calculator
- Delete button (DEL) to remove the last digit
- Decimal number support
- Error handling for division by zero and invalid expressions
- Modern, responsive UI design

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
cd calculator-app
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Linting

```bash
npm run lint
```

## Usage

1. Click digit buttons (0-9) to enter numbers
2. Click operator buttons (+, -, *, /) to perform operations
3. Click "=" to calculate the result
4. Click "C" to clear the calculator
5. Click "DEL" to delete the last entered digit

## Project Structure

```
calculator-app/
├── src/
│   ├── components/
│   │   ├── Calculator.jsx      # Main calculator component
│   │   ├── Calculator.css      # Calculator styles
│   │   └── Calculator.test.jsx # Component tests
│   ├── test/
│   │   └── setup.js           # Test setup configuration
│   ├── App.jsx                # Root application component
│   ├── App.css                # App styles
│   ├── index.css              # Global styles
│   └── main.jsx               # Application entry point
├── package.json
├── vite.config.js
└── README.md
```

## Technologies Used

- React 19
- Vite 8
- Vitest (testing)
- Testing Library (React)
