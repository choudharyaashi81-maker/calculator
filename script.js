
const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");

let expression = "";
let finished = false;

// Handle every calculator button click
buttons.addEventListener("click", function (event) {
  const button = event.target.closest("button");

  if (!button) return;

  const value = button.dataset.value;
  const action = button.dataset.action;

  if (action === "clear") {
    expression = "";
    display.value = "";
    finished = false;
    return;
  }

  if (action === "delete") {
    expression = expression.slice(0, -1);
    display.value = expression;
    finished = false;
    return;
  }

  if (action === "calculate") {
    calculateResult();
    return;
  }

  if (value !== undefined) {
    // Start a new calculation after pressing =
    if (finished) {
      if ("+-*/%".includes(value)) {
        finished = false;
      } else {
        expression = "";
        finished = false;
      }
    }

    // Avoid two decimal points in one number
    if (value === ".") {
      const currentNumber = expression.split(/[+\-*/%]/).pop();
      if (currentNumber.includes(".")) return;

      if (currentNumber === "") {
        expression += "0";
      }
    }

    expression += value;
    display.value = expression;
  }
});

// Calculate without evaluating arbitrary JavaScript
function calculateResult() {
  if (!expression) return;

  try {
    const result = evaluateExpression(expression);

    if (!Number.isFinite(result)) {
      throw new Error("Invalid result");
    }

    expression = String(
      Number(result.toPrecision(12))
    );

    display.value = expression;
    finished = true;
  } catch {
    display.value = "Error";
    expression = "";
    finished = true;
  }
}

// Read numbers and operators
function evaluateExpression(text) {
  const tokens = text.match(
    /(?:\d+\.?\d*|\.\d+)|[+\-*/%]/g
  );

  if (!tokens || tokens.join("") !== text) {
    throw new Error("Invalid expression");
  }

  let position = 0;

  function parseNumber() {
    const token = tokens[position];

    if (token === "+" || token === "-") {
      position++;
      const number = parseNumber();
      return token === "-" ? -number : number;
    }

    if (!token || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
      throw new Error("Expected a number");
    }

    position++;
    return Number(token);
  }

  function parseTerm() {
    let result = parseNumber();

    while (
      position < tokens.length &&
      ["*", "/", "%"].includes(tokens[position])
    ) {
      const operator = tokens[position++];

      if (position >= tokens.length) {
        throw new Error("Missing number");
      }

      const next = parseNumber();

      if (operator === "*") result *= next;
      if (operator === "/") result /= next;
      if (operator === "%") result %= next;
    }

    return result;
  }

  function parseExpression() {
    let result = parseTerm();

    while (
      position < tokens.length &&
      ["+", "-"].includes(tokens[position])
    ) {
      const operator = tokens[position++];

      if (position >= tokens.length) {
        throw new Error("Missing number");
      }

      const next = parseTerm();

      if (operator === "+") result += next;
      if (operator === "-") result -= next;
    }

    return result;
  }

  const result = parseExpression();

  if (position !== tokens.length) {
    throw new Error("Invalid expression");
  }

  return result;
}
