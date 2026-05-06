const SIZE = 9, BOX = 3;
let solution = [], puzzle = [];

// Utility: create empty 9×9 grid
function createEmptyGrid() {
  return Array.from({ length: SIZE },
    () => Array(SIZE).fill(0)
  );
}

// Check if num can go at (r, c)
function isValid(grid, r, c, num) {
  // row & column
  for (let i = 0; i < SIZE; i++) {
    if (grid[r][i] === num || grid[i][c] === num) return false;
  }
  // 3×3 box
  const br = r - r % BOX, bc = c - c % BOX;
  for (let i = 0; i < BOX; i++) {
    for (let j = 0; j < BOX; j++) {
      if (grid[br + i][bc + j] === num) return false;
    }
  }
  return true;
}

// Back-tracking solver
function solveGrid(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) {
        for (let n = 1; n <= SIZE; n++) {
          if (isValid(grid, r, c, n)) {
            grid[r][c] = n;
            if (solveGrid(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Fisher–Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Fill diagonal 3×3 boxes to aid generation
function fillDiagonal(grid) {
  for (let k = 0; k < SIZE; k += BOX) {
    let nums = shuffle([1,2,3,4,5,6,7,8,9]);
    for (let i = 0; i < BOX; i++) {
      for (let j = 0; j < BOX; j++) {
        grid[k + i][k + j] = nums[i * BOX + j];
      }
    }
  }
}

// Generate a new puzzle + full solution
function generatePuzzle() {
  const g = createEmptyGrid();
  fillDiagonal(g);
  solveGrid(g);
  solution = g.map(row => row.slice());
  puzzle  = g.map(row => row.slice());

  // Remove ~45 cells at random
  let toRemove = 45;
  while (toRemove > 0) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      toRemove--;
    }
  }
}

// Render the grid in the DOM
function renderGrid() {
  const container = document.getElementById('sudoku-container');
  container.innerHTML = '';

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.maxLength = 1;
      inp.dataset.r = r;
      inp.dataset.c = c;

      // apply thick borders
      if (r % BOX === 0) inp.classList.add('top-border');
      if (c % BOX === 0) inp.classList.add('left-border');
      if (r === SIZE - 1) inp.classList.add('bottom-border');
      if (c === SIZE - 1) inp.classList.add('right-border');

      if (puzzle[r][c] !== 0) {
        inp.value    = puzzle[r][c];
        inp.readOnly = true;
        inp.classList.add('prefilled');
      } else {
        inp.addEventListener('input', onInput);
      }

      container.appendChild(inp);
    }
  }
}

// Handle user typing
function onInput(e) {
  const inp = e.target,
        val = inp.value.replace(/[^1-9]/g, ''),
        r   = +inp.dataset.r,
        c   = +inp.dataset.c;

  inp.value = val;
  puzzle[r][c] = val ? +val : 0;

  if (val && !isValid(puzzle, r, c, +val)) {
    inp.classList.add('invalid');
  } else {
    inp.classList.remove('invalid');
  }
}

// Solve button
function solvePuzzle() {
  puzzle = solution.map(row => row.slice());
  renderGrid();
}

// Hint button: reveal first empty cell
function showHint() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (puzzle[r][c] === 0) {
        puzzle[r][c] = solution[r][c];
        renderGrid();
        return;
      }
    }
  }
}

// New game button
function newGame() {
  generatePuzzle();
  renderGrid();
}

// Wire up controls
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('new-btn').onclick   = newGame;
  document.getElementById('solve-btn').onclick = solvePuzzle;
  document.getElementById('hint-btn').onclick  = showHint;
  newGame();
});