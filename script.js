// Listener per cambiare i parametri visualizzati in base al tipo di simulazione
document.getElementById('simulationType').addEventListener('change', function () {
    const simulationType = this.value;
    const parameterSections = document.querySelectorAll('.parameter-group');

    // Nasconde tutte le sezioni dei parametri
    parameterSections.forEach(section => section.style.display = 'none');

    // Mostra solo i parametri necessari
    switch (simulationType) {
        case 'simpleEM':
            document.getElementById('simpleEMParams').style.display = 'block';
            break;
        case 'randomWalk':
            document.getElementById('randomWalkParams').style.display = 'block';
            break;
        case 'continuousProcess':
            document.getElementById('continuousProcessParams').style.display = 'block';
            break;
        case 'refinedEM':
            document.getElementById('refinedEMParams').style.display = 'block';
            break;
    }
});

// Listener per avviare la simulazione
document.getElementById('runSimulation').addEventListener('click', function () {
    const simulationType = document.getElementById('simulationType').value;

    switch (simulationType) {
        case 'simpleEM':
            runSimpleEM();
            break;
        case 'randomWalk':
            runRandomWalk();
            break;
        case 'continuousProcess':
            runContinuousProcess();
            break;
        case 'refinedEM':
            runRefinedEM();
            break;
    }
});

// Logica per Simple Euler-Maruyama
function runSimpleEM() {
    const hackerCount = parseInt(document.getElementById('hackerCountSimple').value);
    const serverCount = parseInt(document.getElementById('serverCount').value);
    const penetrationProb = parseFloat(document.getElementById('penetrationProb').value);

    const attackResults = Array.from({ length: hackerCount }, () => [0]);
    for (let hacker = 0; hacker < hackerCount; hacker++) {
        let penetrations = 0;
        for (let server = 1; server <= serverCount; server++) {
            if (Math.random() < penetrationProb) penetrations++;
            attackResults[hacker].push(penetrations);
        }
    }

    renderLineChart(attackResults, serverCount);
    renderHistogram(attackResults.map(path => path[path.length - 1]));
}

// Logica per Random Walk
function runRandomWalk() {
    const hackerCount = parseInt(document.getElementById('hackerCountRandom').value);
    const serverCount = parseInt(document.getElementById('serverCountRandom').value);
    const penetrationProb = parseFloat(document.getElementById('penetrationProbRandom').value);
    const isRelative = document.getElementById('isRelative').checked;

    const attackResults = Array.from({ length: hackerCount }, () => [0]);
    for (let hacker = 0; hackerCount; hacker++) {
        let penetrations = 0;
        for (let server = 1; server <= serverCount; server++) {
            penetrations += Math.random() < penetrationProb ? 1 : -1;
            attackResults[hacker].push(isRelative ? penetrations / serverCount : penetrations);
        }
    }

    renderLineChart(attackResults, serverCount);
    renderHistogram(attackResults.map(path => path[path.length - 1]));
}

// Logica per Continuous Process
function runContinuousProcess() {
    const hackerCount = parseInt(document.getElementById('hackerCountContinuous').value);
    const lambda = parseFloat(document.getElementById('attackRate').value);
    const timeSteps = parseInt(document.getElementById('timeStepsContinuous').value);

    const attackResults = Array.from({ length: hackerCount }, () => [0]);
    for (let hacker = 0; hacker < hackerCount; hacker++) {
        let penetrations = 0;
        for (let step = 1; step <= timeSteps; step++) {
            if (Math.random() < lambda * (1 / timeSteps)) penetrations++;
            attackResults[hacker].push(penetrations);
        }
    }

    renderLineChart(attackResults, timeSteps);
    renderHistogram(attackResults.map(path => path[path.length - 1]));
}

// Logica per Refined Euler-Maruyama
function runRefinedEM() {
    const hackerCount = parseInt(document.getElementById('hackerCountRefined').value);
    const timeSteps = parseInt(document.getElementById('timeStepsRefined').value);
    const jumpProbability = parseFloat(document.getElementById('jumpProbability').value);

    const attackResults = Array.from({ length: hackerCount }, () => [0]);
    for (let hacker = 0; hacker < hackerCount; hacker++) {
        for (let step = 1; step <= timeSteps; step++) {
            const jump = (Math.random() < jumpProbability ? 1 : -1) * Math.sqrt(1 / timeSteps);
            const lastValue = attackResults[hacker][step - 1];
            attackResults[hacker].push(lastValue + jump);
        }
    }

    renderLineChart(attackResults, timeSteps);
    renderHistogram(attackResults.map(path => path[path.length - 1]));
}

// Funzione per disegnare il grafico a linee
function renderLineChart(results, steps) {
    const labels = Array.from({ length: steps + 1 }, (_, i) => i);
    const datasets = results.map((data, idx) => ({
        label: `Path ${idx + 1}`,
        data,
        borderColor: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`,
        fill: false,
        borderWidth: 2
    }));

    const ctx = document.getElementById('serverPenetrationChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: { responsive: true, plugins: { legend: { display: true } } }
    });
}

// Funzione per disegnare l'istogramma
function renderHistogram(finalPenetrations) {
    const labels = [...new Set(finalPenetrations)].sort((a, b) => a - b);
    const data = labels.map(label => finalPenetrations.filter(x => x === label).length);

    const ctx = document.getElementById('attackerDistributionChart').getContext('2d');
    new Chart(ctx, {
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
        options: { responsive: true, plugins: { legend: { display: true } } }
    });
}

