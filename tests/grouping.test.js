//Queremos acessar rapidamente os registros de determinado timestamp
//através de sua chave, sem precisar percorrer todos os registros procurando 
//aquele horário.
const { groupByTimestamp } = require("../src/grouping");

const records = [
    {
        idMonitorado: 40,
        timestamp: "2026-10-01 10:00:00"
    },
    {
        idMonitorado: 44,
        timestamp: "2026-10-01 10:00:00"
    },
    {
        idMonitorado: 50,
        timestamp: "2026-10-01 10:00:05"
    },
    {
        idMonitorado: 60,
        timestamp: "2026-10-01 10:00:05"
    },
    {
        idMonitorado: 70,
        timestamp: "2026-10-01 10:00:10"
    }
];

const grouped = groupByTimestamp(records);

for (const [timestamp, people] of grouped) {
    console.log(`\nTimestamp: ${timestamp}`);

    console.log(
        "Monitorados:",
        people.map(person => person.idMonitorado)
    );
}

console.log("\nTotal de grupos:", grouped.size);
