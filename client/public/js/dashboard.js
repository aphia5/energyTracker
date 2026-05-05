let trendChart, contribChart;

async function loadDashboard() {
  try {
    const [summary, daily, contributions] = await Promise.all([
      apiFetch('/energy/summary'),
      apiFetch('/energy/daily?days=30'),
      apiFetch('/energy/contributions'),
    ]);

    // Stat cards
    document.getElementById('today-kwh').textContent      = summary.today_kwh ?? '—';
    document.getElementById('weekly-avg').textContent     = summary.weekly_avg_kwh ?? '—';
    document.getElementById('yesterday-kwh').textContent  = summary.yesterday_kwh ?? '—';
    document.getElementById('top-room').textContent       = summary.top_room?.name ?? '—';

    const changeEl = document.getElementById('change-pct');
    if (summary.change_percent !== undefined) {
      changeEl.textContent = (summary.change_percent > 0 ? '▲ ' : '▼ ') + Math.abs(summary.change_percent) + '%';
      changeEl.style.color = summary.change_percent > 0 ? '#dc2626' : '#16a34a';
    }

    // 30-day trend chart
    const trendCtx = document.getElementById('trend-chart').getContext('2d');
    if (trendChart) trendChart.destroy();
    trendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: daily.map(d => d.date.slice(5)),
        datasets: [{ label: 'kWh', data: daily.map(d => d.total_kwh), borderColor: '#1a56db', backgroundColor: 'rgba(26,86,219,0.08)', fill: true, tension: 0.3 }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Room contributions chart
    const contribCtx = document.getElementById('contrib-chart').getContext('2d');
    if (contribChart) contribChart.destroy();
    const top8 = contributions.slice(0, 8);
    contribChart = new Chart(contribCtx, {
      type: 'bar',
      data: {
        labels: top8.map(r => r.name),
        datasets: [{ label: 'kWh', data: top8.map(r => r.total_kwh), backgroundColor: '#1a56db' }]
      },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
    });
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

loadDashboard();
