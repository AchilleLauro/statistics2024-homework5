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
                plugins: { legend: { display: true } }
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
                plugins: { legend: { display: true } }
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

    function runContinuousProcess() {
    const numAttackers = parseInt(document.getElementById('hackerCountContinuous').value);
    const lambda = parseFloat(document.getElementById('attackRate').value);
    const timeSteps = parseInt(document.getElementById('timeStepsContinuous').value);
    const dt = 1 / timeSteps; // Intervallo temporale infinitesimale

    const results = Array.from({ length: numAttackers }, () => [0]); // Dati dei percorsi
    const finalPenetrations = []; // Penetrazioni finali

    // Generazione dei dati di simulazione
    for (let attacker = 0; attacker < numAttackers; attacker++) {
        let penetrations = 0;
        for (let step = 1; step <= timeSteps; step++) {
            // Calcolo della probabilità di salto
            const attackSuccess = Math.random() < lambda * dt;
            penetrations += attackSuccess ? 1 : 0;
            results[attacker].push(penetrations); // Aggiungi il valore corrente
        }
        finalPenetrations.push(penetrations); // Registra la penetrazione finale
    }

    // Calcolo media e varianza
    const mean = finalPenetrations.reduce((sum, x) => sum + x, 0) / numAttackers;
    const variance = finalPenetrations.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / numAttackers;

    console.log(`Mean: ${mean.toFixed(4)}, Variance: ${variance.toFixed(4)}`);

    // Aggiorna i grafici
    renderLineChart(results, timeSteps);
    renderHistogram(finalPenetrations);
}


    function runRefinedEM() {
        const numAttackers = parseInt(document.getElementById('hackerCountRefined').value);
        const timeSteps = parseInt(document.getElementById('timeStepsRefined').value);
        const jumpProb = parseFloat(document.getElementById('jumpProbability').value);

        const results = Array.from({ length: numAttackers }, () => [0]);
        for (let i = 0; i < numAttackers; i++) {
            for (let j = 1; j <= timeSteps; j++) {
                const jump = (Math.random() < jumpProb ? 1 : -1) * Math.sqrt(1 / timeSteps);
                results[i].push(results[i][j - 1] + jump);
            }
        }

        renderLineChart(results, timeSteps);
        renderHistogram(results.map(res => res[res.length - 1]));
    }

    // Listener per il pulsante di avvio
    document.getElementById('runSimulation').addEventListener('click', function () {
        const selectedType = document.getElementById('simulationType').value;

        // Mostra i parametri per il tipo selezionato
        document.querySelectorAll('.parameter-group').forEach(group => {
            group.style.display = 'none';
        });

        if (selectedType === 'simpleEM') {
            document.getElementById('simpleEMParams').style.display = 'block';
            runSimpleEM();
        } else if (selectedType === 'randomWalk') {
            document.getElementById('randomWalkParams').style.display = 'block';
            runRandomWalk();
        } else if (selectedType === 'continuousProcess') {
            document.getElementById('continuousProcessParams').style.display = 'block';
            runContinuousProcess();
        } else if (selectedType === 'refinedEM') {
            document.getElementById('refinedEMParams').style.display = 'block';
            runRefinedEM();
        }
    });
});
