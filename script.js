// Canvas context for charts
const serverPenCtx = document.getElementById('serverPenetrationChart').getContext('2d');
const attackerDistCtx = document.getElementById('attackerDistributionChart').getContext('2d');

// Global chart variables
let serverPenetrationGraph = null;
let attackerDistGraph = null;

// Class to manage simulations
class SDEFramework {
    constructor() {
        this.results = [];
    }

    simpleEulerMaruyama(numServers, numAttackers, successProb) {
        const attackResults = Array.from({ length: numAttackers }, () => [0]);
        for (let attacker = 0; attacker < numAttackers; attacker++) {
            let penetrations = 0;
            for (let server = 1; server <= numServers; server++) {
                if (Math.random() < successProb) penetrations++;
                attackResults[attacker].push(penetrations);
            }
        }
        this.results = attackResults;
        this.visualizeResults(numServers, numAttackers, this.getFinalPenetrations());
    }

    randomWalk(numServers, numAttackers, successProb, isRelative = false) {
        const attackResults = Array.from({ length: numAttackers }, () => [0]);
        for (let attacker = 0; attacker < numAttackers; attacker++) {
            let penetrations = 0;
            for (let server = 1; server <= numServers; server++) {
                penetrations += Math.random() < successProb ? 1 : -1;
                attackResults[attacker].push(isRelative ? penetrations / numServers : penetrations);
            }
        }
        this.results = attackResults;
        this.visualizeResults(numServers, numAttackers, this.getFinalPenetrations());
    }

    continuousProcess(numAttackers, lambda, timeSteps) {
        const dt = 1 / timeSteps;
        const attackResults = Array.from({ length: numAttackers }, () => [0]);
        for (let attacker = 0; attacker < numAttackers; attacker++) {
            let penetrations = 0;
            for (let step = 1; step <= timeSteps; step++) {
                if (Math.random() < lambda * dt) penetrations++;
                attackResults[attacker].push(penetrations);
            }
        }
        this.results = attackResults;
        this.visualizeResults(timeSteps, numAttackers, this.getFinalPenetrations());
    }

    refinedEulerMaruyama(numAttackers, timeSteps, p) {
        const dt = 1 / timeSteps;
        const attackResults = Array.from({ length: numAttackers }, () => [0]);
        for (let attacker = 0; attacker < numAttackers; attacker++) {
            for (let step = 1; step <= timeSteps; step++) {
                const jump = (Math.random() < p ? 1 : -1) * Math.sqrt(dt);
                const lastValue = attackResults[attacker][step - 1];
                attackResults[attacker].push(lastValue + jump);
            }
        }
        this.results = attackResults;
        this.visualizeResults(timeSteps, numAttackers, this.getFinalPenetrations());
    }

    getFinalPenetrations() {
        return this.results.map(path => path[path.length - 1]);
    }

    visualizeResults(steps, paths, finalPenetrations) {
        renderLineChart(this.results, steps, paths);
        renderHistogram(finalPenetrations);
    }
}

// Function to render line chart
function renderLineChart(results, steps, paths) {
    const labels = Array.from({ length: steps }, (_, i) => `${i + 1}`);
    const datasets = results.map((data, idx) => ({
        label: `Path ${idx + 1}`,
        data,
        borderColor: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`,
        fill: false,
        stepped: true,
        borderWidth: 2
    }));

    if (serverPenetrationGraph) {
        serverPenetrationGraph.destroy(); // Destroy existing chart
    }

    serverPenetrationGraph = new Chart(serverPenCtx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            scales: {
                y: { beginAtZero: true, ticks: { color: '#999' } },
                x: { ticks: { color: '#999' } }
            },
            plugins: { legend: { display: true } }
        }
    });
}

// Function to render histogram
function renderHistogram(finalPenetrations) {
    const labels = [...new Set(finalPenetrations)].sort((a, b) => a - b);
    const data = labels.map(label => finalPenetrations.filter(x => x === label).length);

    if (attackerDistGraph) {
        attackerDistGraph.destroy(); // Destroy existing chart
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
            scales: {
                y: { beginAtZero: true, ticks: { color: '#999' } },
                x: { ticks: { color: '#999' } }
            },
            plugins: { legend: { display: true } }
        }
    });
}

// Event listeners
document.getElementById('simulationType').addEventListener('change', function () {
    document.querySelectorAll('.parameter-group').forEach(group => group.style.display = 'none');
    document.getElementById(this.value + 'Params').style.display = 'block';
});

document.getElementById('runSimulation').addEventListener('click', function () {
    const simulationType = document.getElementById('simulationType').value;
    const simulator = new SDEFramework();

    if (simulationType === 'simpleEM') {
        const numServers = parseInt(document.getElementById('serverCount').value);
        const numAttackers = parseInt(document.getElementById('hackerCount').value);
        const successProb = parseFloat(document.getElementById('penetrationProb').value);
        simulator.simpleEulerMaruyama(numServers, numAttackers, successProb);
    } else if (simulationType === 'randomWalk') {
        const numServers = parseInt(document.getElementById('serverCount').value);
        const numAttackers = parseInt(document.getElementById('hackerCount').value);
        const successProb = parseFloat(document.getElementById('penetrationProb').value);
        const isRelative = document.getElementById('isRelative').checked;
        simulator.randomWalk(numServers, numAttackers, successProb, isRelative);
    } else if (simulationType === 'continuousProcess') {
        const numAttackers = parseInt(document.getElementById('hackerCount').value);
        const lambda = parseFloat(document.getElementById('attackRate').value);
        const timeSteps = parseInt(document.getElementById('timeSteps').value);
        simulator.continuousProcess(numAttackers, lambda, timeSteps);
    } else if (simulationType === 'refinedEM') {
        const numAttackers = parseInt(document.getElementById('hackerCount').value);
        const timeSteps = parseInt(document.getElementById('timeSteps').value);
        const p = parseFloat(document.getElementById('jumpProbability').value);
        simulator.refinedEulerMaruyama(numAttackers, timeSteps, p);
    }
});

