// Benchmark para medir o desempenho do algoritmo com os datasets fornecidos.
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { performance } = require("node:perf_hooks");

const { processDataset } = require("../src/process-dataset");

const rootDirectory = path.join(__dirname, "..");
const datasetsDirectory = path.join(rootDirectory, "datasets");

const MEGABYTE = 1024 * 1024;

function toMB(bytes) {
    return (bytes / MEGABYTE).toFixed(2);
}

async function benchmarkDataset(datasetNumber) {
    const inputPath = path.join(
        datasetsDirectory,
        `dataset${datasetNumber}.txt`
    );

    const outputPath = path.join(
        os.tmpdir(),
        `benchmark-dataset${datasetNumber}.json`
    );

    if (!fs.existsSync(inputPath)) {
        throw new Error(`Dataset não encontrado: ${inputPath}`);
    }

    let peakRss = process.memoryUsage().rss;

    const memoryMonitor = setInterval(() => {
        const currentRss = process.memoryUsage().rss;

        if (currentRss > peakRss) {
            peakRss = currentRss;
        }
    }, 100);

    const initialRss = process.memoryUsage().rss;
    const startTime = performance.now();

    try {
        console.log(`\nBenchmark do dataset ${datasetNumber}...`);

        const result = await processDataset(inputPath, outputPath);

        const endTime = performance.now();

        const finalRss = process.memoryUsage().rss;

        peakRss = Math.max(peakRss, finalRss);

        const durationSeconds = (
            (endTime - startTime) / 1000
        ).toFixed(2);

        const outputSize = fs.statSync(outputPath).size;

        return {
            dataset: datasetNumber,
            records: result.totalRecords,
            meetings: result.totalMeetings,
            duration: durationSeconds,
            initialMemory: toMB(initialRss),
            peakMemory: toMB(peakRss),
            finalMemory: toMB(finalRss),
            outputSize: toMB(outputSize)
        };
    } finally {
        clearInterval(memoryMonitor);

        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    }
}

async function main() {
    const results = [];

    for (let datasetNumber = 1; datasetNumber <= 7; datasetNumber++) {
        const result = await benchmarkDataset(datasetNumber);

        results.push(result);

        console.log(
            `Registros: ${result.records.toLocaleString("en-US")}`
        );
        console.log(`Encontros: ${result.meetings}`);
        console.log(`Tempo: ${result.duration}s`);
        console.log(`Pico de memória: ${result.peakMemory} MB`);
        console.log(`Tamanho JSON: ${result.outputSize} MB`);
    }

    console.log("\n========== RESUMO DO BENCHMARK ==========\n");

    console.table(results);

    const totalRecords = results.reduce(
        (sum, result) => sum + result.records,
        0
    );

    const totalMeetings = results.reduce(
        (sum, result) => sum + result.meetings,
        0
    );

    const totalDuration = results.reduce(
        (sum, result) => sum + Number(result.duration),
        0
    );

    console.log(`Total de registros: ${totalRecords.toLocaleString("en-US")}`);
    console.log(`Total de encontros: ${totalMeetings}`);
    console.log(`Tempo total: ${totalDuration.toFixed(2)} segundos`);
}

main().catch(error => {
    console.error("Erro durante o benchmark:", error);
    process.exitCode = 1;
});
