
/**
 * Verifica se existe uma relação de medida protetiva
 * entre duas pessoas.
 */
function isProtectiveEncounter(personA, personB) {
    const aProtectsAgainstB =
        personA.medidaProtetiva &&
        personA.idsRestricaoMedida.includes(personB.idMonitorado);
     //o metodo includes() verifica se o array contém o elemento especificado.
    const bProtectsAgainstA =
        personB.medidaProtetiva &&
        personB.idsRestricaoMedida.includes(personA.idMonitorado);

    return aProtectsAgainstB || bProtectsAgainstA;
}

/**
 * Verifica se as duas pessoas pertencem
 * à mesma facção.
 */
function isFactionEncounter(personA, personB) {
    return (
        personA.faccaoMonitorado !== null &&
        personA.faccaoMonitorado === personB.faccaoMonitorado
    );
}

/**
 * Classifica o encontro entre duas pessoas.
 */
function classifyEncounter(personA, personB) {
    if (isProtectiveEncounter(personA, personB)) {
        return "protetiva";
    }

    if (isFactionEncounter(personA, personB)) {
        return "faccao";
    }

    return "generico";
}

module.exports = {
    isProtectiveEncounter,
    isFactionEncounter,
    classifyEncounter
};
