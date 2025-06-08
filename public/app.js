let chart;

async function loadEntries() {
  const res = await fetch('/api/entries');
  const data = await res.json();
  const tbody = document.querySelector('#entriesTable tbody');
  tbody.innerHTML = '';
  data.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${e.date}</td><td>${e.name}</td><td>${e.calories}</td><td>${e.protein}</td><td>${e.carbs}</td><td>${e.fat}</td>`;
    tbody.appendChild(tr);
  });
  updateChart(data);
}

async function loadGoals() {
  const res = await fetch('/api/goals');
  const goals = await res.json();
  document.getElementById('gcalories').value = goals.calories;
  document.getElementById('gprotein').value = goals.protein;
  document.getElementById('gcarbs').value = goals.carbs;
  document.getElementById('gfat').value = goals.fat;
}

async function saveGoals(e) {
  e.preventDefault();
  const goals = {
    calories: parseInt(document.getElementById('gcalories').value, 10),
    protein: parseInt(document.getElementById('gprotein').value, 10),
    carbs: parseInt(document.getElementById('gcarbs').value, 10),
    fat: parseInt(document.getElementById('gfat').value, 10)
  };
  await fetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goals)
  });
  updateChart();
}

function updateChart(entriesData) {
  if (!entriesData) return;
  const totals = entriesData.reduce((acc, e) => {
    if (e.date === new Date().toISOString().slice(0,10)) {
      acc.calories += e.calories;
      acc.protein += e.protein;
      acc.carbs += e.carbs;
      acc.fat += e.fat;
    }
    return acc;
  }, {calories:0, protein:0, carbs:0, fat:0});
  fetch('/api/goals').then(r=>r.json()).then(goals=>{
    const ctx = document.getElementById('progressChart');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Calories','Protéines','Glucides','Lipides'],
        datasets: [
          { label: 'Consommé', data: [totals.calories, totals.protein, totals.carbs, totals.fat], backgroundColor: 'rgba(54, 162, 235, 0.5)' },
          { label: 'Objectif', data: [goals.calories, goals.protein, goals.carbs, goals.fat], backgroundColor: 'rgba(255, 99, 132, 0.5)' }
        ]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  });
}

async function addEntry(e) {
  e.preventDefault();
  const entry = {
    name: document.getElementById('name').value,
    calories: parseInt(document.getElementById('calories').value, 10),
    protein: parseInt(document.getElementById('protein').value, 10),
    carbs: parseInt(document.getElementById('carbs').value, 10),
    fat: parseInt(document.getElementById('fat').value, 10),
    date: new Date().toISOString().slice(0,10)
  };
  await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  e.target.reset();
  loadEntries();
}

document.getElementById('entryForm').addEventListener('submit', addEntry);
document.getElementById('goalsForm').addEventListener('submit', saveGoals);
loadEntries();
loadGoals();
