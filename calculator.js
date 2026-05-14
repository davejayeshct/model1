// Get the result display element
const resultDisplay = document.getElementById('result');

// Append a value to the display
function appendValue(value) {
    // Prevent multiple operators in a row
    if (['+', '-', '*', '/'].includes(value)) {
        if (resultDisplay.value === '') return;
        if (['+', '-', '*', '/'].includes(resultDisplay.value[resultDisplay.value.length - 1])) {
            return;
        }
    }
    
    // Prevent multiple decimal points in a number
    if (value === '.') {
        const lastOperatorIndex = Math.max(
            resultDisplay.value.lastIndexOf('+'),
            resultDisplay.value.lastIndexOf('-'),
            resultDisplay.value.lastIndexOf('*'),
            resultDisplay.value.lastIndexOf('/')
        );
        const lastNumber = resultDisplay.value.substring(lastOperatorIndex + 1);
        if (lastNumber.includes('.')) return;
    }
    
    resultDisplay.value += value;
}

// Calculate the result
function calculate() {
    try {
        if (resultDisplay.value === '') return;
        const result = eval(resultDisplay.value);
        resultDisplay.value = result;
    } catch (error) {
        resultDisplay.value = 'Error';
        setTimeout(() => {
            resultDisplay.value = '';
        }, 1500);
    }
}

// Clear the display
function clearDisplay() {
    resultDisplay.value = '';
}

// Delete the last character
function deleteLast() {
    resultDisplay.value = resultDisplay.value.slice(0, -1);
}

// Allow keyboard input
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Number and decimal point
    if ((key >= '0' && key <= '9') || key === '.') {
        appendValue(key);
    }
    // Operators
    else if (key === '+' || key === '-' || key === '*' || key === '/') {
        event.preventDefault();
        appendValue(key);
    }
    // Enter or = for calculation
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }
    // Backspace for delete
    else if (key === 'Backspace') {
        event.preventDefault();
        deleteLast();
    }
    // Escape for clear
    else if (key === 'Escape') {
        clearDisplay();
    }
});
