const { calculateDistance } = require("./distance");
const { classifyEncounter } = require("./rules");

const MAX_DISTANCE = 20;

/**
 * Detecta encontros dentro de um grupo de timestamp.
 */
function detectMeetings(groupedRecords) {
    const meetings = [];
    const registeredMeetings = new Set(); // Set para armazenar encontros já registrados, evitando duplicatas.
    
    for (const [timestamp, people] of groupedRecords) {

        // Compara cada par apenas uma vez.
        for (let i = 0; i < people.length; i++) {
            for (let j = i + 1; j < people.length; j++) {

                const personA = people[i];
                const personB = people[j];

                // Evita comparar uma pessoa com ela mesma.
                if (personA.idMonitorado === personB.idMonitorado) {
                    continue;
                }

                const distance = calculateDistance(personA, personB);

                // A distância precisa ser menor que 20 metros.
                if (distance >= MAX_DISTANCE) {
                    continue;
                }

                // Organização solicitada aplicada aqui:
                const ids = [
                    personA.idMonitorado,
                    personB.idMonitorado
                ].sort((a, b) => a - b);

                const meetingKey = `${timestamp}:${ids[0]}:${ids[1]}`;

                if (registeredMeetings.has(meetingKey)) {
                    continue;
                }

                const type = classifyEncounter(personA, personB);

                registeredMeetings.add(meetingKey);

                // Inserção do encontro no array de resultados
                meetings.push({
                    tipo: type,
                    monitoradosEncontro: ids, // Reaproveita o array ordenado criado acima
                    timestamp,
                    posicoes: {
                        [personA.idMonitorado]: {
                            lat: personA.latitude,
                            lon: personA.longitude
                        },
                        [personB.idMonitorado]: {
                            lat: personB.latitude,
                            lon: personB.longitude
                        }
                    },
                    distanciaMetros: distance
                });
            }
        }
    }

    return meetings;
}

module.exports = { detectMeetings };
