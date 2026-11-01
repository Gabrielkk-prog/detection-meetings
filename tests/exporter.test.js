
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { exportMeetings } = require("../src/exporter");

const sampleMeetings = [
    {
        tipo: "generico",
        monitoradosEncontro: [10, 20],
        timestamp: "2024-01-01 10:00:00",
        posicoes: {
            "10": { lat: -10.0, lon: -37.0 },
            "20": { lat: -10.0001, lon: -37.0001 }
        },
        distanciaMetros: 15.5
    }
];

const fileName = "test-meetings.json";
const outputPath = path.join(
    __dirname,
    "..",
    "outputs",
    fileName
);

// Exporta os encontros
exportMeetings(sampleMeetings, fileName);

// Lê o arquivo gerado
const fileContent = fs.readFileSync(outputPath, "utf8");
const parsedContent = JSON.parse(fileContent);

// Confere se o conteúdo foi preservado
assert.deepEqual(parsedContent, sampleMeetings);

console.log("Teste de exportação passou!");
