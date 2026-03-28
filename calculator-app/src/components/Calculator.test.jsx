import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from './Calculator';

describe('Calculator', () => {
  const getButton = (text) => screen.getByRole('button', { name: text });

  it('renders calculator with display showing 0', () => {
    render(<Calculator />);
    const display = screen.getByText('0', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });

  it('displays digit when clicked', () => {
    render(<Calculator />);
    fireEvent.click(getButton('5'));
    const display = screen.getByText('5', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });

  it('performs addition correctly', () => {
    render(<Calculator />);
    fireEvent.click(getButton('2'));
    fireEvent.click(getButton('+'));
    fireEvent.click(getButton('3'));
    fireEvent.click(getButton('='));
    const display = screen.getByText('5', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });

  it('performs subtraction correctly', () => {
    render(<Calculator />);
    fireEvent.click(getButton('9'));
    fireEvent.click(getButton('-'));
    fireEvent.click(getButton('4'));
    fireEvent.click(getButton('='));
    const display = screen.getByText('5', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });

  it('performs multiplication correctly', () => {
    render(<Calculator />);
    fireEvent.click(getButton('3'));
    fireEvent.click(getButton('\u00D7'));
    fireEvent.click(getButton('4'));
    fireEvent.click(getButton('='));
    const display = screen.getByText('12', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });

  it('performs division correctly', () => {
    render(<Calculator />);
    fireEvent.click(getButton('8'));
    fireEvent.click(getButton('\u00F7'));
    fireEvent.click(getButton('2'));
    fireEvent.click(getButton('='));
    const display = screen.getByText('4', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });

  it('handles division by zero', () => {
    render(<Calculator />);
    fireEvent.click(getButton('5'));
    fireEvent.click(getButton('\u00F7'));
    fireEvent.click(getButton('0'));
    fireEvent.click(getButton('='));
    const display = screen.getByText('Error', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });

  it('clears display when C is clicked', () => {
    render(<Calculator />);
    fireEvent.click(getButton('5'));
    fireEvent.click(getButton('C'));
    const display = screen.getByText('0', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });

  it('handles decimal numbers', () => {
    render(<Calculator />);
    fireEvent.click(getButton('1'));
    fireEvent.click(getButton('.'));
    fireEvent.click(getButton('5'));
    fireEvent.click(getButton('+'));
    fireEvent.click(getButton('2'));
    fireEvent.click(getButton('.'));
    fireEvent.click(getButton('5'));
    fireEvent.click(getButton('='));
    const display = screen.getByText('4', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });

  it('handles multi-digit numbers', () => {
    render(<Calculator />);
    fireEvent.click(getButton('1'));
    fireEvent.click(getButton('2'));
    fireEvent.click(getButton('3'));
    fireEvent.click(getButton('+'));
    fireEvent.click(getButton('4'));
    fireEvent.click(getButton('5'));
    fireEvent.click(getButton('6'));
    fireEvent.click(getButton('='));
    const display = screen.getByText('579', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });

  it('handles backspace/delete', () => {
    render(<Calculator />);
    fireEvent.click(getButton('1'));
    fireEvent.click(getButton('2'));
    fireEvent.click(getButton('3'));
    fireEvent.click(getButton('DEL'));
    const display = screen.getByText('12', { selector: '.current-value' });
    expect(display).toBeInTheDocument();
  });
});
