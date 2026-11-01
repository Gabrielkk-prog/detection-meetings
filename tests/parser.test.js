
const { parseLine } = require("../src/parser");

const line = "50;;2026-10-01 00:00:00;-10.07996;-37.08384;true;40,44";

const result = parseLine(line);

console.log(result);
console.log("\nID numérico:", typeof result.idMonitorado);
console.log("Medida protetiva:", typeof result.medidaProtetiva);
console.log("Restrições:", result.idsRestricaoMedida);
