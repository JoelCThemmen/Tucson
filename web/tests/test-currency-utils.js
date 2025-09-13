import { formatCurrency, parseCurrency, formatCurrencyInput } from '../src/utils/currency.js';

console.log('Testing currency formatting utilities:\n');

// Test formatCurrency
console.log('formatCurrency(250000):', formatCurrency(250000));
console.log('formatCurrency("1500000"):', formatCurrency("1500000"));
console.log('formatCurrency(2500000):', formatCurrency(2500000));
console.log('formatCurrency(750000):', formatCurrency(750000));

// Test parseCurrency
console.log('\nparseCurrency("250,000"):', parseCurrency("250,000"));
console.log('parseCurrency("1,500,000"):', parseCurrency("1,500,000"));
console.log('parseCurrency("$2,500,000"):', parseCurrency("$2,500,000"));

// Test formatCurrencyInput
console.log('\nformatCurrencyInput("250000"):', formatCurrencyInput("250000"));
console.log('formatCurrencyInput("1500000"):', formatCurrencyInput("1500000"));
console.log('formatCurrencyInput("abc123def456"):', formatCurrencyInput("abc123def456"));