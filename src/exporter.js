//O fs é um módulo do Node.js que fornece uma API para interagir com o sistema
// de arquivos. Ele permite ler, escrever, atualizar e excluir arquivos, 
// bem como realizar outras operações relacionadas a arquivos e diretórios.
const fs = require("node:fs");
const path = require("node:path");

function exportMeetings(meetings, fileName = "meetings.json") {
    const outputPath = path.join(
        __dirname,
        "..",
        "outputs",
        fileName
    );

    fs.writeFileSync(
        outputPath,
        JSON.stringify(meetings, null, 2),
        "utf8"
    );

    console.log(`Arquivo gerado: ${outputPath}`);
}

module.exports = { exportMeetings };
