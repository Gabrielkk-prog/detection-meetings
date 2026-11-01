
/**
 * Converte uma linha do dataset em um objeto JavaScript.
 */


function parseLine(line) {
    const fields = line.replace(/\r$/, "").split(";");

    const cleanField = (value) => {
        if (value === undefined) return "";
        return value.trim().replace(/^"(.*)"$/, "$1");
    };

    const rawRestrictions = cleanField(fields[6]);

    return {
        idMonitorado: Number(cleanField(fields[0])),
        faccaoMonitorado:
            cleanField(fields[1]) === ""
                ? null
                : Number(cleanField(fields[1])),
        timestamp: cleanField(fields[2]),
        latitude: Number(cleanField(fields[3])),
        longitude: Number(cleanField(fields[4])),
        medidaProtetiva: cleanField(fields[5]) === "true",
        idsRestricaoMedida: rawRestrictions
            ? rawRestrictions.split(",").map(Number)
            : []
    };
}

module.exports = { parseLine };


