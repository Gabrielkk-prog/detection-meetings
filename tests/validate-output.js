//Nao satifeito, eu quero validar estruturalmente os sete arquivos de saida,
//para saber se existe alguma inconsistência.
//Sera a auditoria final do sistema, para saber se o algoritmo esta correto.
const fs = require("node:fs");
const path = require("node:path");
const { calculateDistance } = require("../src/distance");

const root = path.join(__dirname, "..");
const outputDirectory = path.join(root, "outputs");

const datasets = [1, 2, 3, 4, 5, 6, 7];

let totalMeetings = 0;
let totalErrors = 0;

for (const datasetNumber of datasets) {
    const filePath = path.join(
        outputDirectory,
        `dataset${datasetNumber}-meetings.json`
    );

    console.log(`\nValidando dataset ${datasetNumber}...`);

    if (!fs.existsSync(filePath)) {
        console.error("ERRO: arquivo não encontrado.");
        totalErrors++;
        continue;
    }

    let meetings;

    try {
        meetings = JSON.parse(
            fs.readFileSync(filePath, "utf8")
        );
    } catch (error) {
        console.error("ERRO: JSON inválido.");
        totalErrors++;
        continue;
    }

    if (!Array.isArray(meetings)) {
        console.error("ERRO: a saída não é um array.");
        totalErrors++;
        continue;
    }

    const registeredPairs = new Set();
    let errors = 0;

    for (const meeting of meetings) {
        const ids = meeting.monitoradosEncontro;

        if (
            !["generico", "faccao", "protetiva"].includes(meeting.tipo) ||
            !Array.isArray(ids) ||
            ids.length !== 2 ||
            ids[0] === ids[1] ||
            typeof meeting.timestamp !== "string" ||
            !meeting.posicoes ||
            !Number.isFinite(meeting.distanciaMetros) ||
            meeting.distanciaMetros < 0 ||
            meeting.distanciaMetros >= 20
        ) {
            errors++;
            continue;
        }

        const key =
            `${meeting.timestamp}:${[...ids].sort((a, b) => a - b).join(":")}`;

        if (registeredPairs.has(key)) {
            errors++;
            continue;
        }

        registeredPairs.add(key);

        const [idA, idB] = ids;

        const positionA = meeting.posicoes[idA];
        const positionB = meeting.posicoes[idB];

        if (!positionA || !positionB) {
            continue;
        }

        const calculatedDistance = calculateDistance(
            {
                latitude: positionA.lat,
                longitude: positionA.lon
            },
            {
                latitude: positionB.lat,
                longitude: positionB.lon
            }
        );

        const difference = Math.abs(
            calculatedDistance - meeting.distanciaMetros
        );

        if (difference > 0.000001) {
            errors++;
            console.error(
                `Distância divergente no encontro ${idA}-${idB}: ${difference} m`
            );
        }
        for (const id of ids) {
            const position = meeting.posicoes[id];

            if (
                !position ||
                !Number.isFinite(position.lat) ||
                !Number.isFinite(position.lon)
            ) {
                errors++;
                break;
            }
        }
    }

    totalMeetings += meetings.length;
    totalErrors += errors;

    console.log(`Encontros encontrados: ${meetings.length}`);
    console.log(`Inconsistências: ${errors}`);
    console.log(errors === 0 ? "Resultado estruturalmente válido." : "Requer investigação.");
}

console.log("\n================================");
console.log(`Total de encontros: ${totalMeetings}`);
console.log(`Total de inconsistências: ${totalErrors}`);
console.log(
    totalErrors === 0
        ? "AUDITORIA CONCLUÍDA SEM INCONSISTÊNCIAS."
        : "AUDITORIA ENCONTROU PROBLEMAS."
);
