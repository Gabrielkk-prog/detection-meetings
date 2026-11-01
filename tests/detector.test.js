
const assert = require("node:assert/strict");

const { groupByTimestamp } = require("../src/grouping");
const { detectMeetings } = require("../src/meeting-detector");

const records = [
    // Encontro genérico
    {
        idMonitorado: 1,
        faccaoMonitorado: 1,
        timestamp: "2026-10-01 10:00:00",
        latitude: -10.00000,
        longitude: -37.00000,
        medidaProtetiva: false,
        idsRestricaoMedida: []
    },
    {
        idMonitorado: 2,
        faccaoMonitorado: 2,
        timestamp: "2026-10-01 10:00:00",
        latitude: -10.00000,
        longitude: -37.00005,
        medidaProtetiva: false,
        idsRestricaoMedida: []
    },

    // Encontro de facção
    {
        idMonitorado: 3,
        faccaoMonitorado: 7,
        timestamp: "2026-10-01 10:00:05",
        latitude: -10.00000,
        longitude: -37.00000,
        medidaProtetiva: false,
        idsRestricaoMedida: []
    },
    {
        idMonitorado: 4,
        faccaoMonitorado: 7,
        timestamp: "2026-10-01 10:00:05",
        latitude: -10.00000,
        longitude: -37.00005,
        medidaProtetiva: false,
        idsRestricaoMedida: []
    },

    // Encontro de medida protetiva
    {
        idMonitorado: 5,
        faccaoMonitorado: null,
        timestamp: "2026-10-01 10:00:10",
        latitude: -10.00000,
        longitude: -37.00000,
        medidaProtetiva: false,
        idsRestricaoMedida: []
    },
    {
        idMonitorado: 6,
        faccaoMonitorado: null,
        timestamp: "2026-10-01 10:00:10",
        latitude: -10.00000,
        longitude: -37.00005,
        medidaProtetiva: true,
        idsRestricaoMedida: [5]
    }
];

const grouped = groupByTimestamp(records);

const meetings = detectMeetings(grouped);

console.log("\nEncontros encontrados:");

console.log(JSON.stringify(meetings, null, 2));

// Validando os resultados
assert.equal(meetings.length, 3);

assert.deepEqual(
    meetings.map(meeting => meeting.tipo),
    ["generico", "faccao", "protetiva"]
);

assert.ok(
    meetings.every(meeting => meeting.distanciaMetros < 20)
);

console.log("\nTodos os testes passaram!");


const { calculateDistance } = require("../src/distance");

// Cria registros fictícios para os testes
function createPerson(id, latitude, longitude) {
    return {
        idMonitorado: id,
        faccaoMonitorado: null,
        timestamp: "2024-01-01 10:00:00",
        latitude,
        longitude,
        medidaProtetiva: false,
        idsRestricaoMedida: []
    };
}

// Teste 1: um monitorado não pode encontrar a si mesmo
{
    const person = createPerson(1, 0, 0);

    const meetings = detectMeetings(
        new Map([[person.timestamp, [person, person]]])
    );

    assert.equal(meetings.length, 0);
}

// Teste 2: registros duplicados do mesmo par não geram encontros repetidos
{
    const personA = createPerson(1, 0, 0);
    const personB = createPerson(2, 0, 0.00005);
    const personADuplicate = createPerson(1, 0, 0);

    const meetings = detectMeetings(
        new Map([
            [personA.timestamp, [
                personA,
                personB,
                personADuplicate
            ]]
        ])
    );

    assert.equal(meetings.length, 1);
}

// Teste 3: a distância precisa ser estritamente menor que 20 metros
{
    const personA = createPerson(1, 0, 0);

    const longitude = (20.001 / 6371000) * (180 / Math.PI);
    const personB = createPerson(2, 0, longitude);

    assert.ok(calculateDistance(personA, personB) >= 20);

    const meetings = detectMeetings(
        new Map([[personA.timestamp, [personA, personB]]])
    );

    assert.equal(meetings.length, 0);
}

// Teste 4: distância menor que 20 metros deve gerar encontro
{
    const personA = createPerson(1, 0, 0);

    const longitude = (19.999 / 6371000) * (180 / Math.PI);
    const personB = createPerson(2, 0, longitude);

    assert.ok(calculateDistance(personA, personB) < 20);

    const meetings = detectMeetings(
        new Map([[personA.timestamp, [personA, personB]]])
    );

    assert.equal(meetings.length, 1);
}

console.log("Testes adicionais de integridade passaram!");
