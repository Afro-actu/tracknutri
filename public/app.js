async function loadEntries() {
  const res = await fetch('/api/entries');
  const data = await res.json();
  const tbody = document.querySelector('#entriesTable tbody');
  tbody.innerHTML = '';
  data.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${e.name}</td><td>${e.calories}</td><td>${e.protein}</td><td>${e.carbs}</td><td>${e.fat}</td>`;
    tbody.appendChild(tr);
  });
}

async function addEntry(e) {
  e.preventDefault();
  const entry = {
    name: document.getElementById('name').value,
    calories: parseInt(document.getElementById('calories').value, 10),
    protein: parseInt(document.getElementById('protein').value, 10),
    carbs: parseInt(document.getElementById('carbs').value, 10),
    fat: parseInt(document.getElementById('fat').value, 10)
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
loadEntries();
