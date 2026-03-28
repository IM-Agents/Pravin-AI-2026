import { useState } from 'react';
import './Calculator.css';

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [hasResult, setHasResult] = useState(false);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleDigit = (digit) => {
    if (hasResult) {
      setDisplay(digit);
      setExpression(digit);
      setHasResult(false);
      setWaitingForOperand(false);
    } else if (waitingForOperand) {
      setDisplay(digit);
      setExpression(expression + digit);
      setWaitingForOperand(false);
    } else if (display === '0' && digit !== '.') {
      setDisplay(digit);
      setExpression(expression === '' || expression === '0' ? digit : expression.slice(0, -1) + digit);
    } else if (digit === '.' && display.includes('.')) {
      return;
    } else {
      setDisplay(display + digit);
      setExpression(expression + digit);
    }
  };

  const handleOperator = (operator) => {
    setHasResult(false);
    const lastChar = expression.slice(-1);
    
    if (['+', '-', '*', '/'].includes(lastChar)) {
      setExpression(expression.slice(0, -1) + operator);
    } else if (expression === '') {
      if (operator === '-') {
        setExpression('-');
        setDisplay('-');
      }
    } else {
      setExpression(expression + operator);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setHasResult(false);
    setWaitingForOperand(false);
  };

  const handleEquals = () => {
    if (!expression) return;
    
    try {
      const sanitizedExpression = expression.replace(/[^0-9+\-*/.]/g, '');
      
      if (/\/0(?![0-9.])/.test(sanitizedExpression)) {
        setDisplay('Error');
        setExpression('');
        setHasResult(true);
        return;
      }

      const result = Function('"use strict"; return (' + sanitizedExpression + ')')();
      
      if (!isFinite(result)) {
        setDisplay('Error');
        setExpression('');
        setHasResult(true);
        return;
      }

      const formattedResult = Number.isInteger(result) 
        ? result.toString() 
        : parseFloat(result.toFixed(10)).toString();
      
      setDisplay(formattedResult);
      setExpression(formattedResult);
      setHasResult(true);
    } catch {
      setDisplay('Error');
      setExpression('');
      setHasResult(true);
    }
  };

  const handleBackspace = () => {
    if (hasResult) {
      handleClear();
      return;
    }
    
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
    
    if (expression.length > 0) {
      setExpression(expression.slice(0, -1));
    }
  };

  const buttons = [
    { label: 'C', action: handleClear, className: 'clear' },
    { label: 'DEL', action: handleBackspace, className: 'delete' },
    { label: '/', action: () => handleOperator('/'), className: 'operator' },
    { label: '*', action: () => handleOperator('*'), className: 'operator' },
    { label: '7', action: () => handleDigit('7') },
    { label: '8', action: () => handleDigit('8') },
    { label: '9', action: () => handleDigit('9') },
    { label: '-', action: () => handleOperator('-'), className: 'operator' },
    { label: '4', action: () => handleDigit('4') },
    { label: '5', action: () => handleDigit('5') },
    { label: '6', action: () => handleDigit('6') },
    { label: '+', action: () => handleOperator('+'), className: 'operator' },
    { label: '1', action: () => handleDigit('1') },
    { label: '2', action: () => handleDigit('2') },
    { label: '3', action: () => handleDigit('3') },
    { label: '=', action: handleEquals, className: 'equals', rowSpan: true },
    { label: '0', action: () => handleDigit('0'), colSpan: true },
    { label: '.', action: () => handleDigit('.') },
  ];

  return (
    <div className="calculator">
      <div className="calculator-display">
        <div className="expression">{expression || '0'}</div>
        <div className="current-value">{display}</div>
      </div>
      <div className="calculator-buttons">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.action}
            className={`calc-btn ${btn.className || ''} ${btn.colSpan ? 'col-span-2' : ''} ${btn.rowSpan ? 'row-span-2' : ''}`}
          >
            {btn.label === '*' ? '\u00D7' : btn.label === '/' ? '\u00F7' : btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Calculator;
