
const { calculateDistance } = require("../src/distance");

// Teste 1: Mesma localização
const pointA = {
    latitude: -10.07996,
    longitude: -37.08384
};

const pointB = {
    latitude: -10.07996,
    longitude: -37.08384
};

console.log(
    "Mesma localização:",
    calculateDistance(pointA, pointB),
    "metros"
);

// Teste 2: Coordenadas próximas
const pointC = {
    latitude: -10.07996,
    longitude: -37.08384
};

const pointD = {
    latitude: -10.07987,
    longitude: -37.08389
};

console.log(
    "Pessoas próximas:",
    calculateDistance(pointC, pointD),
    "metros"
);

// Teste 3: Coordenadas distantes
const pointE = {
    latitude: -10.08000,
    longitude: -37.08400
};

const pointF = {
    latitude: -10.09000,
    longitude: -37.09000
};

console.log(
    "Pessoas distantes:",
    calculateDistance(pointE, pointF),
    "metros"
);
