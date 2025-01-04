document.addEventListener('DOMContentLoaded', function () {
    const serverPenCtx = document.getElementById('serverPenetrationChart').getContext('2d');
    const attackerDistCtx = document.getElementById('attackerDistributionChart').getContext('2d');

    let serverPenetrationGraph = null;
    let attackerDistGraph = null;

    // Mostra solo i parametri specifici per il tipo di simulazione selezionato
    document.getElementById('simulationType').addEventListener('change', function () {
        const selectedType = this.value;

        // Nascondi tutti i gruppi di parametri
        document.querySelectorAll('.parameter-group').forEach(group => {
            group.style.display = 'none';
        });

        // Mostra solo i parametri specifici
        if (selectedType === 'simpleEM') {
            document.getElementById('simpleEMParams').style.display = 'block';
        } else if (selectedType === 'randomWalk') {
            document.getElementById('randomWalkParams').style.display = 'block';
        } else if (selectedType === 'continuousProcess') {
            document.getElementById('continuousProcessParams').style.display = 'block';
        } else if (selectedType === 'refinedEM') {
            document.getElementById('refinedEMParams').style.display = 'block';
        }
    });

    // Distruggi grafico esistente e crea un nuovo grafico lineare
    function renderLineChart(results, steps) {
        const labels = Array.from({ length: steps + 1 }, (_, i) => `${i}`);
        const datasets = results.map((data, idx) => ({
            label: `Path ${idx + 1}`,
            data,
            borderColor: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`,
            fill: false,
            stepped: true,
            borderWidth: 2
        }));

        if (serverPenetrationGraph) {
            serverPenetrationGraph.destroy();
        }

        serverPenetrationGraph = new Chart(serverPenCtx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#999' } },
                    x: { ticks: { color: '#999' } }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 20,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        enabled: true
                    }
                },
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20
                    }
                }
            }
        });
    }

    // Distruggi grafico esistente e crea un nuovo istogramma
    function renderHistogram(finalPenetrations) {
        const labels = [...new Set(finalPenetrations)].sort((a, b) => a - b);
        const data = labels.map(label => finalPenetrations.filter(x => x === label).length);

        if (attackerDistGraph) {
            attackerDistGraph.destroy();
        }

        attackerDistGraph = new Chart(attackerDistCtx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Final Distribution',
                    data,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#999' } },
                    x: { ticks: { color: '#999' } }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 20,
                            font: { size: 12 }
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20
                    }
                }
            }
        });
    }

    // Simulazioni
    function runSimpleEM() {
        const numServers = parseInt(document.getElementById('serverCount').value);
        const numAttackers = parseInt(document.getElementById('hackerCountSimple').value);
        const successProb = parseFloat(document.getElementById('penetrationProb').value);

        const results = Array.from({ length: numAttackers }, () => [0]);
        for (let i = 0; i < numAttackers; i++) {
            for (let j = 1; j <= numServers; j++) {
                results[i].push(results[i][j - 1] + (Math.random() < successProb ? 1 : 0));
            }
        }

        renderLineChart(results, numServers);
        renderHistogram(results.map(res => res[res.length - 1]));
    }

    function runRandomWalk() {
        const numServers = parseInt(document.getElementById('serverCountRandom').value);
        const numAttackers = parseInt(document.getElementById('hackerCountRandom').value);
        const successProb = parseFloat(document.getElementById('penetrationProbRandom').value);
        const isRelative = document.getElementById('isRelative').checked;

        const results = Array.from({ length: numAttackers }, () => [0]);
        for (let i = 0; i < numAttackers; i++) {
            for (let j = 1; j <= numServers; j++) {
                const step = Math.random() < successProb ? 1 : -1;
                results[i].push(results[i][j - 1] + step);
            }
        }

        renderLineChart(results, numServers);
        renderHistogram(results.map(res => res[res.length - 1]));
    }

    // Listener per il pulsante di avvio
    document.getElementById('runSimulation').addEventListener('click', function () {
        const selectedType = document.getElementById('simulationType').value;

        // Nascondi tutti i parametri
        document.querySelectorAll('.parameter-group').forEach(group => {
            group.style.display = 'none';
        });

        // Mostra il gruppo corretto e avvia la simulazione
        if (selectedType === 'simpleEM') {
            document.getElementById('simpleEMParams').style.display = 'block';
            runSimpleEM();
        } else if (selectedType === 'randomWalk') {
            document.getElementById('randomWalkParams').style.display = 'block';
            runRandomWalk();
        }
    });
});

