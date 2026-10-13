/* =========    1. THEME TOGGLE   =============== */

const themeToggle = document.getElementById('themeToggle');

// Apply saved theme on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.setAttribute('data-theme', 'dark');
}

// Toggle theme when button is clicked
themeToggle.addEventListener('click', () => {
  const isDark = document.body.getAttribute('data-theme') === 'dark';

  if (isDark) {
    document.body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
});


/* ===========    2. CALCULATOR — STATE    ============= */

const calculator = {
  previousOperand: '',
  currentOperand: '0',
  operation: undefined,
  shouldResetScreen: false
};


/* ===========   3. CALCULATOR — DOM ELEMENTS  ================ */

const previousOperandElement = document.getElementById('previousOperand');
const currentOperandElement  = document.getElementById('currentOperand');
const buttonsContainer       = document.getElementById('buttons');


/* ===========   4. CALCULATOR — HELPERS   =================== */

function roundResult(number) {
  return Math.round(number * 1e10) / 1e10;
}

function updateDisplay() {
  // Big line: always shows current operand
  currentOperandElement.textContent = calculator.currentOperand;

  // Small line: shows previous operand + operator (if any)
  if (calculator.operation != null) {
    const displayOp = calculator.operation === '*' ? '×'
                    : calculator.operation === '/' ? '÷'
                    : calculator.operation;

    previousOperandElement.textContent =
      `${calculator.previousOperand} ${displayOp}`;
  } else {
    previousOperandElement.textContent = '';
  }
}


/* ==========   5. CALCULATOR — LOGIC    =================== */

function appendNumber(number) {
  // If we just finished a calculation, start fresh
  if (calculator.shouldResetScreen) {
    calculator.currentOperand = '';
    calculator.shouldResetScreen = false;
  }

  // Prevent multiple decimal points
  if (number === '.' && calculator.currentOperand.includes('.')) return;

  // Replace leading zero (no "05")
  if (calculator.currentOperand === '0' && number !== '.') {
    calculator.currentOperand = number;
  } else {
    calculator.currentOperand += number;
  }
}

function chooseOperation(op) {
  // Ignore if nothing to operate on
  if (calculator.currentOperand === '' && calculator.previousOperand === '') return;

  // If both operands exist, calculate first (chaining)
  if (calculator.currentOperand !== '' && calculator.previousOperand !== '') {
    calculate();
  }

  calculator.operation = op;
  calculator.previousOperand = calculator.currentOperand;
  calculator.currentOperand = '';
}

function calculate() {
  const prev = parseFloat(calculator.previousOperand);
  const curr = parseFloat(calculator.currentOperand);

  // Both must be valid numbers
  if (isNaN(prev) || isNaN(curr)) return;

  let result;
  switch (calculator.operation) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '*': result = prev * curr; break;
    case '/':
      if (curr === 0) {
        alert("Can't divide by zero!");
        return;
      }
      result = prev / curr;
      break;
    default:
      return;
  }

  calculator.currentOperand = roundResult(result).toString();
  calculator.operation = undefined;
  calculator.previousOperand = '';
  calculator.shouldResetScreen = true;
}

function clearAll() {
  calculator.previousOperand = '';
  calculator.currentOperand = '0';
  calculator.operation = undefined;
  calculator.shouldResetScreen = false;
}

function deleteLast() {
  if (calculator.shouldResetScreen) return;

  if (calculator.currentOperand.length === 1) {
    calculator.currentOperand = '0';
  } else {
    calculator.currentOperand = calculator.currentOperand.slice(0, -1);
  }
}

function handleEquals() {
  if (!calculator.operation) return;
  if (calculator.currentOperand === '') return;
  calculate();
}


/* ============    6. CALCULATOR — MOUSE EVENT LISTENER   ================ */

buttonsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const value  = button.dataset.value;

  if (!action) {
    appendNumber(value);
  } else if (action === 'operator') {
    chooseOperation(value);
  } else if (action === 'clear') {
    clearAll();
  } else if (action === 'delete') {
    deleteLast();
  } else if (action === 'equals') {
    handleEquals();
  }

  updateDisplay();
});


/* ===========   7. CALCULATOR — KEYBOARD SUPPORT  ================== */

document.addEventListener('keydown', (event) => {
  const key = event.key;

  // Numbers 0-9
  if (key >= '0' && key <= '9') {
    appendNumber(key);
    updateDisplay();
    return;
  }

  // Decimal point
  if (key === '.') {
    appendNumber('.');
    updateDisplay();
    return;
  }

  // Operators (accept x/X as multiply too)
  if (key === '+' || key === '-' || key === '*' || key === '/' ||
      key === 'x' || key === 'X') {
    const operator = (key === 'x' || key === 'X') ? '*' : key;
    chooseOperation(operator);
    updateDisplay();
    return;
  }

  // Equals
  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    handleEquals();
    updateDisplay();
    return;
  }

  // Delete last character
  if (key === 'Backspace') {
    event.preventDefault();
    deleteLast();
    updateDisplay();
    return;
  }

  // Clear everything
  if (key === 'Escape') {
    clearAll();
    updateDisplay();
    return;
  }
});


/* ============   8. INIT — Paint the initial state    ============== */

updateDisplay();