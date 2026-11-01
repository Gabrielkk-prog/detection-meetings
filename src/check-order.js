// maquina para verificar se os arquivos de entrada estão ordenados.
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

async function checkFileOrder(filePath) {
    const stream = fs.createReadStream(filePath, {
        encoding: "utf8"
    });

    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
    });

    let previousTimestamp = null;
    let totalRecords = 0;
    let outOfOrder = 0;

    for await (const line of rl) {
        if (!line || line.startsWith("idMonitorado;")) {
            continue;
        }

        const fields = line.split(";");
        const currentTimestamp = fields[2];

        if (!currentTimestamp) {
            continue;
        }

        if (
            previousTimestamp !== null &&
            currentTimestamp < previousTimestamp
        ) {
            outOfOrder++;
        }

        previousTimestamp = currentTimestamp;
        totalRecords++;
    }

    return {
        file: path.basename(filePath),
        totalRecords,
        outOfOrder,
        isOrdered: outOfOrder === 0
    };
}

async function main() {
    for (let i = 1; i <= 7; i++) {
        const filePath = path.join(
            __dirname,
            "..",
            "datasets",
            `dataset${i}.txt`
        );

        const result = await checkFileOrder(filePath);

        console.log("--------------------------------");
        console.log(`Arquivo: ${result.file}`);
        console.log(`Registros: ${result.totalRecords}`);
        console.log(`Quebras de ordem: ${result.outOfOrder}`);
        console.log(
            `Ordenado: ${result.isOrdered ? "SIM" : "NÃO"}`
        );
    }
}

main().catch(error => {
    console.error("Erro ao verificar os arquivos:", error);
    process.exitCode = 1;
});
