document.addEventListener('DOMContentLoaded', () => {
    createStarryBackground();
    // ... (previous DOMContentLoaded code) ...
});

function createStarryBackground() {
    const spaceBackground = document.getElementById('space-background');
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        spaceBackground.appendChild(star);
    }

    const scene = document.getElementById('space-background');
    const parallaxInstance = new Parallax(scene, {
        relativeInput: true,
        hoverOnly: true,
        inputElement: document.body
    });
}

const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const apiKey = 'YOUR_NASA_API_KEY'; // Replace with your actual NASA API key

let currentPlanet = '';
let currentImageIndex = 0;
let planetImages = [];
let planetData = {};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('random-planet').addEventListener('click', getRandomPlanet);
    document.getElementById('prev-image').addEventListener('click', () => changePlanetImage(-1));
    document.getElementById('next-image').addEventListener('click', () => changePlanetImage(1));
    createSolarSystem();
    getRandomPlanet();
    document.querySelector('[data-bs-target="#quizModal"]').addEventListener('click', startQuiz);
});

function createSolarSystem() {
    const solarSystem = document.getElementById('solar-system');
    planets.forEach(planet => {
        const planetIcon = document.createElement('div');
        planetIcon.className = 'planet-icon';
        planetIcon.style.backgroundColor = getPlanetColor(planet);
        planetIcon.addEventListener('click', () => fetchPlanetData(planet));
        solarSystem.appendChild(planetIcon);
    });
}

function getPlanetColor(planet) {
    const colors = {
        mercury: '#888888', venus: '#e6e6e6', earth: '#3333ff',
        mars: '#ff4d4d', jupiter: '#ffad33', saturn: '#ffff99',
        uranus: '#99ffff', neptune: '#3366ff', pluto: '#cc9966'
    };
    return colors[planet] || '#ffffff';
}

function getRandomPlanet() {
    const randomIndex = Math.floor(Math.random() * planets.length);
    fetchPlanetData(planets[randomIndex]);
}

function fetchPlanetData(planet) {
    currentPlanet = planet;
    updateActivePlanet();
    fetchPlanetImages(planet);
    fetchPlanetFacts(planet);
}

function updateActivePlanet() {
    document.querySelectorAll('.planet-icon').forEach((icon, index) => {
        icon.classList.toggle('active', planets[index] === currentPlanet);
    });
}

function fetchPlanetImages(planet) {
    fetch(`https://images-api.nasa.gov/search?q=${planet}&media_type=image`)
        .then(response => response.json())
        .then(data => {
            planetImages = data.collection.items.slice(0, 5).map(item => item.links[0].href);
            currentImageIndex = 0;
            updatePlanetImage();
        })
        .catch(error => console.error('Error fetching planet images:', error));
}

function updatePlanetImage() {
    const image = document.getElementById('planet-image');
    image.src = planetImages[currentImageIndex];
    image.alt = currentPlanet;
}

function changePlanetImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = planetImages.length - 1;
    if (currentImageIndex >= planetImages.length) currentImageIndex = 0;
    updatePlanetImage();
}

function fetchPlanetFacts(planet) {
    fetch(`https://api.le-systeme-solaire.net/rest/bodies/${planet}`)
        .then(response => response.json())
        .then(data => {
            planetData = data;
            updatePlanetInfo(data);
            updatePlanetDetails(data);
        })
        .catch(error => console.error('Error fetching planet data:', error));
}
function updatePlanetInfo(data) {
    document.getElementById('planet-name').textContent = data.englishName;
    const factsList = document.getElementById('planet-facts');
    factsList.innerHTML = '';
    
    const facts = [
        `Mass: ${data.mass ? `${data.mass.massValue.toExponential(2)} × 10^${data.mass.massExponent} kg` : 'Unknown'}`,
        `Radius: ${data.meanRadius ? `${data.meanRadius.toLocaleString()} km` : 'Unknown'}`,
        `Gravity: ${data.gravity ? `${data.gravity.toFixed(2)} m/s²` : 'Unknown'}`,
        `Temperature: ${data.avgTemp ? `${data.avgTemp} K` : 'Unknown'}`,
        `Orbital Period: ${data.sideralOrbit ? `${data.sideralOrbit.toFixed(2)} Earth days` : 'Unknown'}`,
        `Rotation Period: ${data.sideralRotation ? `${data.sideralRotation.toFixed(2)} hours` : 'Unknown'}`
    ];

    facts.forEach(fact => {
        const li = document.createElement('li');
        li.textContent = fact;
        li.className = 'list-group-item';
        factsList.appendChild(li);
    });
}
function updatePlanetDetails(data) {
    const detailsContainer = document.getElementById('planet-details');
    detailsContainer.innerHTML = '';

    const details = [
        {
            title: 'Orbital Characteristics',
            content: `
                <p>Aphelion: ${data.aphelion ? `${data.aphelion.toLocaleString()} km` : 'Unknown'}</p>
                <p>Perihelion: ${data.perihelion ? `${data.perihelion.toLocaleString()} km` : 'Unknown'}</p>
                <p>Eccentricity: ${data.eccentricity ? data.eccentricity.toFixed(4) : 'Unknown'}</p>
                <p>Inclination: ${data.inclination ? `${data.inclination.toFixed(2)}°` : 'Unknown'}</p>
            `
        },
        {
            title: 'Inside View',
            content: `
                <p>Internal Structure: <span id="internal-structure">Loading...</span></p>
                <p>Core: <span id="core-info">Loading...</span></p>
                <p>Mantle: <span id="mantle-info">Loading...</span></p>
                <p>Crust: <span id="crust-info">Loading...</span></p>
                <canvas id="layersChart" width="400" height="200"></canvas>
            `
        }
    ];

    details.forEach((detail, index) => {
        const accordion = createAccordionItem(detail.title, detail.content, index);
        detailsContainer.appendChild(accordion);
    });

    fetchInsideViewData(data.englishName);
}
function fetchInsideViewData(planetName) {
    // This would ideally be an API call. For now, we'll use hardcoded data.
    const insideData = getInsideViewData(planetName);
    
    document.getElementById('internal-structure').textContent = insideData.structure;
    document.getElementById('core-info').textContent = insideData.core;
    document.getElementById('mantle-info').textContent = insideData.mantle;
    document.getElementById('crust-info').textContent = insideData.crust;

    createLayersChart(insideData.layers);
}

function getInsideViewData(planetName) {
    const data = {
        'Mercury': {
            structure: 'Iron core with rocky mantle',
            core: 'Large iron core',
            mantle: 'Thin silicate mantle',
            crust: 'Thin crust',
            layers: [70, 20, 10]
        },
        'Venus': {
            structure: 'Similar to Earth, with a core, mantle, and crust',
            core: 'Iron-nickel core',
            mantle: 'Rocky mantle',
            crust: 'Solid crust',
            layers: [50, 45, 5]
        },
        'Earth': {
            structure: 'Distinct core, mantle, and crust',
            core: 'Solid inner core, liquid outer core',
            mantle: 'Silicate rock mantle',
            crust: 'Thin crust (oceanic and continental)',
            layers: [55, 40, 5]
        },
        'Mars': {
            structure: 'Core, mantle, and crust',
            core: 'Partially liquid core',
            mantle: 'Silicate mantle',
            crust: 'Thick crust',
            layers: [45, 45, 10]
        },
        'Jupiter': {
            structure: 'No solid surface, gradually transitioning layers',
            core: 'Possible rocky or metallic core',
            mantle: 'Liquid metallic hydrogen layer',
            crust: 'Outer layer of molecular hydrogen',
            layers: [20, 70, 10]
        },
        'Saturn': {
            structure: 'Similar to Jupiter, with less distinct layers',
            core: 'Rocky core surrounded by metallic hydrogen',
            mantle: 'Liquid metallic hydrogen layer',
            crust: 'Outer layer of gas and ice',
            layers: [25, 65, 10]
        },
        'Uranus': {
            structure: 'Ice giant with a small rocky core',
            core: 'Small rocky core',
            mantle: 'Icy mantle of water, ammonia, and methane',
            crust: 'Hydrogen and helium atmosphere',
            layers: [20, 70, 10]
        },
        'Neptune': {
            structure: 'Similar to Uranus, ice giant structure',
            core: 'Rocky core',
            mantle: 'Icy mantle',
            crust: 'Hydrogen, helium, and methane atmosphere',
            layers: [20, 70, 10]
        },
        'Pluto': {
            structure: 'Differentiated into core, mantle, and crust',
            core: 'Rocky core',
            mantle: 'Water ice mantle',
            crust: 'Nitrogen ice crust with methane and CO',
            layers: [40, 50, 10]
        }
    };

    return data[planetName] || {
        structure: 'Unknown',
        core: 'Unknown',
        mantle: 'Unknown',
        crust: 'Unknown',
        layers: [33, 33, 34]
    };
}

function createLayersChart(layersData) {
    const ctx = document.getElementById('layersChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Core', 'Mantle', 'Crust/Atmosphere'],
            datasets: [{
                data: layersData,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Approximate Layer Composition'
                }
            }
        }
    });
}

function createAccordionItem(title, content, index) {
    const accordion = document.createElement('div');
    accordion.className = 'accordion-item';
    accordion.innerHTML = `
        <h2 class="accordion-header" id="heading${index}">
            <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                ${title}
            </button>
        </h2>
        <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#planet-details">
            <div class="accordion-body">
                ${content}
            </div>
        </div>
    `;
    return accordion;
}

function createCompositionChart(data) {
    const ctx = document.getElementById('compositionChart').getContext('2d');
    const hydrogen = data.vol_potential?.volHydrogen || 0;
    const helium = data.vol_potential?.volHelium || 0;
    const other = Math.max(0, 100 - hydrogen - helium);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Hydrogen', 'Helium', 'Other'],
            datasets: [{
                data: [hydrogen, helium, other],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Composition (if available)'
                }
            }
        }
    });
}

// Quiz functionality
function startQuiz() {
    const quizContent = document.getElementById('quiz-content');
    quizContent.innerHTML = '';
    
    const question = createQuizQuestion();
    quizContent.appendChild(question);
}

function createQuizQuestion() {
    const questionContainer = document.createElement('div');
    const randomPlanet = planets[Math.floor(Math.random() * planets.length)];
    
    const question = document.createElement('p');
    question.textContent = `Which planet has the following characteristics?`;
    questionContainer.appendChild(question);

    fetch(`https://api.le-systeme-solaire.net/rest/bodies/${randomPlanet}`)
        .then(response => response.json())
        .then(data => {
            const facts = [
                `Mass: ${data.mass.massValue.toExponential(2)} × 10^${data.mass.massExponent} kg`,
                `Radius: ${data.meanRadius.toLocaleString()} km`,
                `Gravity: ${data.gravity.toFixed(2)} m/s²`
            ];
            
            const factsList = document.createElement('ul');
            facts.forEach(fact => {
                const li = document.createElement('li');
                li.textContent = fact;
                factsList.appendChild(li);
            });
            questionContainer.appendChild(factsList);

            const options = createQuizOptions(randomPlanet);
            questionContainer.appendChild(options);
        })
        .catch(error => console.error('Error fetching planet data for quiz:', error));

    return questionContainer;
}

function createQuizOptions(correctPlanet) {
    const optionsContainer = document.createElement('div');
    const shuffledPlanets = shuffleArray([...planets]);
    
    shuffledPlanets.slice(0, 4).forEach(planet => {
        const option = document.createElement('div');
        option.className = 'quiz-option';
        option.textContent = planet.charAt(0).toUpperCase() + planet.slice(1);
        option.addEventListener('click', () => checkAnswer(option, planet === correctPlanet));
        optionsContainer.appendChild(option);
    });

    return optionsContainer;
}

function checkAnswer(selectedOption, isCorrect) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => option.style.pointerEvents = 'none');

    if (isCorrect) {
        selectedOption.classList.add('correct');
        setTimeout(() => {
            alert('Correct! Great job!');
            startQuiz(); // Start a new question
        }, 1000);
    } else {
        selectedOption.classList.add('incorrect');
        setTimeout(() => {
            alert('Incorrect. Try again!');
            startQuiz(); // Start a new question
        }, 1000);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
document.addEventListener('DOMContentLoaded', () => {
    createStarryBackground();
    initCometAnimation();
    // ... (previous DOMContentLoaded code) ...
});

function initCometAnimation() {
    const canvas = document.getElementById('comet-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const comets = [];

    function Comet() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.length = Math.random() * 80 + 10;
        this.speed = Math.random() * 2 + 1;
        this.thickness = Math.random() * 2 + 0.5;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
    }

    Comet.prototype.draw = function() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y + this.length);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness;
        ctx.stroke();
    }

    Comet.prototype.move = function() {
        this.x += this.speed;
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.x = Math.random() * canvas.width;
            this.y = 0;
        }
    }

    function createComet() {
        if (comets.length < 20 && Math.random() < 0.03) {
            comets.push(new Comet());
        }
    }

    function animateComets() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        createComet();
        comets.forEach(comet => {
            comet.draw();
            comet.move();
        });
        requestAnimationFrame(animateComets);
    }

    animateComets();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
document.addEventListener('DOMContentLoaded', () => {
    createStarryBackground();
    initCometAnimation();
    updateFooterYear();
    // ... (previous DOMContentLoaded code) ...
});

function updateFooterYear() {
    const currentYear = new Date().getFullYear();
    document.getElementById('current-year').textContent = currentYear;
}