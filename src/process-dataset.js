// processador de streaming de datasets, 
// que lê um arquivo de entrada linha por linha,
// agrupa os registros por timestamp,
// detecta encontros entre pessoas e escreve os resultados
// em um arquivo de saída.
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const { once } = require("node:events");
const { finished } = require("node:stream/promises");

const { parseLine } = require("./parser");
const { detectMeetings } = require("./meeting-detector");

async function writeChunk(output, content) {
    if (!output.write(content)) {
        await once(output, "drain");
    }
}

async function processDataset(inputPath, outputPath) {
    // B. Verificar se o arquivo de entrada existe
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Arquivo não encontrado: ${inputPath}`);
    }

    const input = fs.createReadStream(inputPath, {
        encoding: "utf8"
    });

    const reader = readline.createInterface({
        input,
        crlfDelay: Infinity
    });

    const output = fs.createWriteStream(outputPath, {
        encoding: "utf8"
    });

    let currentTimestamp = null;
    let currentRecords = [];
    let totalRecords = 0;
    let totalMeetings = 0;
    let firstMeeting = true;

    async function flushCurrentGroup() {
        if (currentRecords.length === 0) {
            return;
        }

        const groupedRecords = new Map([
            [currentTimestamp, currentRecords]
        ]);

        const meetings = detectMeetings(groupedRecords);

        for (const meeting of meetings) {
            const separator = firstMeeting ? "" : ",";
            await writeChunk(
                output,
                separator + JSON.stringify(meeting)
            );

            firstMeeting = false;
            totalMeetings++;
        }

        currentRecords = [];
    }

    try {
        await writeChunk(output, "[");

        for await (const line of reader) {
            if (!line || line.startsWith("idMonitorado;")) {
                continue;
            }

            const record = parseLine(line);

            // C. Validar a ordem dos timestamps
            if (
                currentTimestamp !== null &&
                record.timestamp < currentTimestamp
            ) {
                throw new Error(
                    `Dataset fora de ordem: ${record.timestamp} apareceu após ${currentTimestamp}`
                );
            }

            if (currentTimestamp === null) {
                currentTimestamp = record.timestamp;
            }

            if (record.timestamp !== currentTimestamp) {
                await flushCurrentGroup();
                currentTimestamp = record.timestamp;
            }

            currentRecords.push(record);
            totalRecords++;
        }

        await flushCurrentGroup();

        await writeChunk(output, "]");
        output.end();

        await finished(output);

        return {
            totalRecords,
            totalMeetings,
            outputPath
        };
    } catch (error) {
        reader.close();
        input.destroy();
        output.destroy();
        throw error;
    }
}

async function main() {
    const datasetNumber = Number(process.argv[2]);

    if (
        !Number.isInteger(datasetNumber) ||
        datasetNumber < 1 ||
        datasetNumber > 7
    ) {
        throw new Error(
            "Informe um dataset entre 1 e 7. Exemplo: node src/process-dataset.js 1"
        );
    }

    const rootDirectory = path.join(__dirname, "..");
    const inputPath = path.join(
        rootDirectory,
        "datasets",
        `dataset${datasetNumber}.txt`
    );

    const outputDirectory = path.join(rootDirectory, "outputs");

    fs.mkdirSync(outputDirectory, { recursive: true });

    const outputPath = path.join(
        outputDirectory,
        `dataset${datasetNumber}-meetings.json`
    );

    console.log(`Processando dataset${datasetNumber}...`);

    const result = await processDataset(inputPath, outputPath);

    console.log("--------------------------------");
    console.log(`Registros processados: ${result.totalRecords}`);
    console.log(`Encontros encontrados: ${result.totalMeetings}`);
    console.log(`Arquivo gerado: ${result.outputPath}`);
    console.log("Processamento concluído!");
}

// A. Impedir execução automática durante importação
if (require.main === module) {
    main().catch(error => {
        console.error("Erro no processamento:", error);
        process.exitCode = 1;
    });
}

module.exports = { processDataset };
