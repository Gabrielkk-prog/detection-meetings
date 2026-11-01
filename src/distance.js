
const EARTH_RADIUS = 6371000;

/**
 * Converte graus para radianos.
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calcula a distância entre duas coordenadas
 * utilizando a fórmula de Haversine.
 */
function calculateDistance(pointA, pointB) {
    const lat1 = toRadians(pointA.latitude);
    const lat2 = toRadians(pointB.latitude);

    const lon1 = toRadians(pointA.longitude);
    const lon2 = toRadians(pointB.longitude);

    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) ** 2;

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return EARTH_RADIUS * c;
}

module.exports = {
    calculateDistance,
    toRadians
};
