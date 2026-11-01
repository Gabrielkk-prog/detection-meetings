// A quantidade igual de encontros não garante que sejam os mesmos,
// por isso precisamos comparar para saber se nossa resposta bate com a oficial.
// Vai ser a nossa prova real de que o algoritmo está correto.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const datasetNumber = Number(process.argv[2]);

if (!Number.isInteger(datasetNumber) || datasetNumber < 1 || datasetNumber > 7) {
    throw new Error("Informe um dataset entre 1 e 7.");
}

const root = path.join(__dirname, "..");
const outputDirectory = path.join(root, "outputs");

const expected = JSON.parse(
    fs.readFileSync(
        path.join(outputDirectory, `respostas${datasetNumber}.json`),
        "utf8"
    )
);

const actual = JSON.parse(
    fs.readFileSync(
        path.join(outputDirectory, `dataset${datasetNumber}-meetings.json`),
        "utf8"
    )
);

function sortMeetings(meetings) {
    return [...meetings].sort((a, b) => {
        const keyA = `${a.timestamp}:${a.monitoradosEncontro.join(":")}`;
        const keyB = `${b.timestamp}:${b.monitoradosEncontro.join(":")}`;

        return keyA.localeCompare(keyB);
    });
}

function compareMeetings(expectedMeeting, actualMeeting) {
    assert.equal(actualMeeting.tipo, expectedMeeting.tipo);

    assert.deepEqual(
        actualMeeting.monitoradosEncontro,
        expectedMeeting.monitoradosEncontro
    );

    assert.equal(actualMeeting.timestamp, expectedMeeting.timestamp);

    assert.deepEqual(actualMeeting.posicoes, expectedMeeting.posicoes);

    const difference = Math.abs(
        actualMeeting.distanciaMetros -
        expectedMeeting.distanciaMetros
    );

    assert.ok(
        difference <= 0.000001,
        `Diferença de distância: ${difference} metros`
    );
}

assert.equal(
    actual.length,
    expected.length,
    "Quantidade de encontros diferente da resposta oficial"
);

const sortedExpected = sortMeetings(expected);
const sortedActual = sortMeetings(actual);

for (let i = 0; i < sortedExpected.length; i++) {
    compareMeetings(sortedExpected[i], sortedActual[i]);
}

console.log("================================");
console.log(`DATASET ${datasetNumber}: COMPARAÇÃO CONCLUÍDA`);
console.log(`Encontros oficiais: ${expected.length}`);
console.log(`Encontros encontrados: ${actual.length}`);
console.log("Todos os encontros correspondem à resposta oficial!");
