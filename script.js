// === Canvas Context ===
const ctx = document.getElementById('vectorCanvas').getContext('2d');

// === App State ===
let method = 'triangle';          // default method
let vectorCount = 2;              // default number of vectors
let initialDraw = true;           // true before pressing play
let draggingIndex = null;         // index of vector currently being dragged

// === Default Vectors (up to 3 supported) ===
let vectors = [
  { magnitude: 80, angle: 0 },
  { magnitude: 70, angle: 30 },
  { magnitude: 60, angle: -45 }
];

// === Helpers ===
const degToRad = deg => (deg * Math.PI) / 180;
const polarToCartesian = (mag, deg) => {
  const r = degToRad(deg);
  return { x: mag * Math.cos(r), y: mag * Math.sin(r) };
};

// === Vector Inputs Update ===
function updateVectorInputs() {
  const c = document.getElementById('vectorInputs');
  c.innerHTML = '';
  for (let i = 0; i < vectorCount; i++) {
    const v = vectors[i];
    c.innerHTML += `
      <div>
        <label>Vector ${i + 1} - Magnitude:
          <input type="number" value="${v.magnitude}" onchange="updateVector(${i},'magnitude',this.value)">
        </label>
        <label>Angle:
          <input type="number" value="${v.angle}" onchange="updateVector(${i},'angle',this.value)">
        </label>
      </div>`;
  }
}

// === Input Change Handler ===
const updateVector = (i, f, val) => {
  vectors[i][f] = parseFloat(val);
  updateChart();
};

// === Switch between triangle or parallelogram methods ===
const setMethod = m => {
  method = m;

  // Highlight selected method button
  document.getElementById('triangleBtn').classList.remove('active');
  document.getElementById('parallelogramBtn').classList.remove('active');

  if (m === 'triangle') {
    document.getElementById('triangleBtn').classList.add('active');
  } else {
    document.getElementById('parallelogramBtn').classList.add('active');
  }

  updateChart();
};

// === Update number of vectors shown ===
const updateVectorCount = () => {
  vectorCount = +document.getElementById('vectorCount').value;
  updateVectorInputs();
  updateChart();
};

// === Chart Axes Setup ===
const drawAxes = () => ({
  x: { type: 'linear', position: 'bottom', min: -300, max: 300, grid: { color: '#ccc' }, ticks: { stepSize: 30 } },
  y: { type: 'linear', position: 'left', min: -300, max: 300, grid: { color: '#ccc' }, ticks: { stepSize: 30 } }
});

// === Main Logic: Vector Rendering ===
function calculateData() {
  const data = [];
  const clr = ['blue', 'orange', 'purple']; // colors for vectors
  let cart = [];
  let res = { x: 0, y: 0 };
  let cur = { x: 0, y: 0 };
  const showResult = !initialDraw;

  // Case 1: 2 vectors - triangle method
  if (vectorCount === 2 && method === 'triangle') {
    for (let i = 0; i < 2; i++) {
      const comp = polarToCartesian(vectors[i].magnitude, vectors[i].angle);
      cart.push(comp);
      const start = (showResult && i === 1) ? { ...cur } : { x: 0, y: 0 };
      const end = { x: start.x + comp.x, y: start.y + comp.y };

      data.push({
        label: `Vector ${i + 1}`,
        data: [start, end],
        borderColor: clr[i],
        backgroundColor: clr[i],
        showLine: true,
        pointRadius: 4,
        borderWidth: 3
      });

      cur = end;
      res.x += comp.x;
      res.y += comp.y;
    }

    if (showResult) {
      data.push({
        label: 'Resultant = V1 + V2',
        data: [{ x: 0, y: 0 }, { ...cur }],
        borderColor: 'red',
        backgroundColor: 'red',
        showLine: true,
        pointRadius: 4,
        borderWidth: 3
      });
    }
  }

  // Case 2: 2 vectors - parallelogram method
  else if (vectorCount === 2 && method === 'parallelogram') {
    const [v1, v2] = vectors.map(v => polarToCartesian(v.magnitude, v.angle));
    res = { x: v1.x + v2.x, y: v1.y + v2.y }; // ✅ Assign to `res` instead of res2

    data.push({ label: 'Vector 1', data: [{ x: 0, y: 0 }, { x: v1.x, y: v1.y }], borderColor: clr[0], showLine: true, pointRadius: 4, borderWidth: 3 });
    data.push({ label: 'Vector 2', data: [{ x: 0, y: 0 }, { x: v2.x, y: v2.y }], borderColor: clr[1], showLine: true, pointRadius: 4, borderWidth: 3 });

    if (showResult) {
      data.push({ label: 'Resultant = V1 + V2', data: [{ x: 0, y: 0 }, res], borderColor: 'red', showLine: true, pointRadius: 4, borderWidth: 3 });
      data.push({ label: 'Dashed V1', data: [{ x: v2.x, y: v2.y }, { x: res.x, y: res.y }], borderColor: 'gray', borderDash: [6, 4], showLine: true, pointRadius: 0, borderWidth: 2 });
      data.push({ label: 'Dashed V2', data: [{ x: v1.x, y: v1.y }, { x: res.x, y: res.y }], borderColor: 'gray', borderDash: [6, 4], showLine: true, pointRadius: 0, borderWidth: 2 });
    }
  }

  // Case 3: 3 vectors - triangle method
  else if (vectorCount === 3 && method === 'triangle') {
    let cur = { x: 0, y: 0 };

    for (let i = 0; i < 3; i++) {
      const comp = polarToCartesian(vectors[i].magnitude, vectors[i].angle);
      cart.push(comp);

      const start = initialDraw ? { x: 0, y: 0 } : { ...cur };
      const end = { x: start.x + comp.x, y: start.y + comp.y };

      data.push({
        label: `Vector ${i + 1}`,
        data: [start, end],
        borderColor: clr[i],
        backgroundColor: clr[i],
        showLine: true,
        pointRadius: 4,
        borderWidth: 3
      });

      cur = end;
      res.x += comp.x;
      res.y += comp.y;

      if (showResult && i === 1) {
        data.push({
          label: 'Resultant 1 = V1 + V2',
          data: [{ x: 0, y: 0 }, { ...cur }],
          borderColor: 'green',
          showLine: true,
          pointRadius: 4,
          borderWidth: 3
        });
      }
    }

    if (showResult) {
      data.push({
        label: 'Resultant 2 = R1 + V3',
        data: [{ x: 0, y: 0 }, { ...cur }],
        borderColor: 'red',
        showLine: true,
        pointRadius: 4,
        borderWidth: 3
      });
    }
  }

  // Case 4: 3 vectors - parallelogram
  else if (vectorCount === 3 && method === 'parallelogram') {
    if (initialDraw) {
      // Show all vectors from origin
      for (let i = 0; i < 3; i++) {
        const comp = polarToCartesian(vectors[i].magnitude, vectors[i].angle);
        cart.push(comp);
        res.x += comp.x;
        res.y += comp.y;

        data.push({
          label: `Vector ${i + 1}`,
          data: [{ x: 0, y: 0 }, { x: comp.x, y: comp.y }],
          borderColor: clr[i],
          showLine: true,
          pointRadius: 4,
          borderWidth: 3
        });
      }
    } else {
      // Tail-to-tail vectors
      let cur = { x: 0, y: 0 };
      for (let i = 0; i < 3; i++) {
        const comp = polarToCartesian(vectors[i].magnitude, vectors[i].angle);
        cart.push(comp);

        const start = { ...cur };
        const end = { x: start.x + comp.x, y: start.y + comp.y };

        data.push({
          label: `Vector ${i + 1}`,
          data: [start, end],
          borderColor: clr[i],
          showLine: true,
          pointRadius: 4,
          borderWidth: 3
        });

        cur = end;
        res.x += comp.x;
        res.y += comp.y;
      }

      data.push({
        label: 'Resultant = V1 + V2 + V3',
        data: [{ x: 0, y: 0 }, res],
        borderColor: 'red',
        showLine: true,
        pointRadius: 4,
        borderWidth: 3
      });

      // Dashed vectors: V3 first, then V2, V1 — tail to tail
      let dashStart = { x: 0, y: 0 };
      for (let i = 2; i >= 0; i--) {
        const comp = polarToCartesian(vectors[i].magnitude, vectors[i].angle);
        const end = {
          x: dashStart.x + comp.x,
          y: dashStart.y + comp.y
        };

        data.push({
          label: `Dashed Vector ${i + 1}`,
          data: [dashStart, end],
          borderColor: 'gray',
          borderDash: [6, 4],
          showLine: true,
          pointRadius: 0,
          borderWidth: 2
        });

        dashStart = end;
      }
    }
  }

  const shouldShowResult = method === 'parallelogram' || showResult;
  updateResultOutput(shouldShowResult ? res : null);
  return data;
}

// === Output Resultant Text ===
const updateResultOutput = res => {
  if (!res) {
    document.getElementById('resultOutput').innerText = `Magnitude: --, Angle: --`;
    return;
  }
  const mag = Math.hypot(res.x, res.y).toFixed(2);
  const ang = (Math.atan2(res.y, res.x) * 180 / Math.PI).toFixed(2);
  document.getElementById('resultOutput').innerText = `Magnitude: ${mag}, Angle: ${ang}°`;
};

// === Create Chart ===
let chart = new Chart(ctx, {
  type: 'line',
  data: { datasets: calculateData() },
  options: {
    responsive: false,
    maintainAspectRatio: false,
    scales: drawAxes(),
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: c => `${c.dataset.label}: (${c.raw.x.toFixed(2)}, ${c.raw.y.toFixed(2)})`
        }
      },
      annotation: {
        annotations: {
          yAxisLine: { type: 'line', xMin: 0, xMax: 0, borderColor: 'black', borderWidth: 3 },
          xAxisLine: { type: 'line', yMin: 0, yMax: 0, borderColor: 'black', borderWidth: 3 }
        }
      }
    },
    elements: { line: { tension: 0.1 } }
  }
});

// === Initialize ===
updateVectorInputs();

// === Button Actions ===
const animateVectors = () => {
  initialDraw = false;
  updateChart();
};

const resetVectors = () => {
  initialDraw = true;
  updateChart();
};

// === Drag-and-Drop Vector Editing ===
const canvas = document.getElementById('vectorCanvas');

canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  chart.data.datasets.forEach((ds, i) => {
    if (i >= vectorCount) return;
    const end = chart.getDatasetMeta(i).data[1];
    const dx = mouseX - end.x;
    const dy = mouseY - end.y;
    if (Math.hypot(dx, dy) < 10) draggingIndex = i;
  });
});

canvas.addEventListener('mousemove', e => {
  if (draggingIndex === null) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const xs = chart.scales.x;
  const ys = chart.scales.y;

  const xVal = xs.getValueForPixel(mouseX);
  const yVal = ys.getValueForPixel(mouseY);

  vectors[draggingIndex].magnitude = Math.hypot(xVal, yVal);
  vectors[draggingIndex].angle = Math.atan2(yVal, xVal) * 180 / Math.PI;

  updateVectorInputs();
  updateChart();
});

canvas.addEventListener('mouseup', () => { draggingIndex = null; });
canvas.addEventListener('mouseleave', () => { draggingIndex = null; });

// === Refresh Chart ===
function updateChart() {
  chart.data.datasets = calculateData();
  chart.options.scales = drawAxes();
  chart.update();
}
