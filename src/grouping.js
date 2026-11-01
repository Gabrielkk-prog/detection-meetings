
/**
 * Agrupa os posicionamentos pelo timestamp exato.
 */
function groupByTimestamp(records) {
    const groups = new Map();

    for (const record of records) { //percorre todos os registros recebidos.
        const timestamp = record.timestamp;

        if (!groups.has(timestamp)) { // verifica se aquele horario ja existe.
            groups.set(timestamp, []); // se nao existir cria um vazio.
        }

        groups.get(timestamp).push(record); //adiciona a pessoa no grupo correto.
    }

    return groups;
}

module.exports = { groupByTimestamp };
