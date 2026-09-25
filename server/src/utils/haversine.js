/**
 * Calculates the Haversine distance between two points on the Earth.
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {{ distanceKm: number, distanceMeters: number, formattedDistance: string }}
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (
    !Number.isFinite(nLat1) ||
    !Number.isFinite(nLon1) ||
    !Number.isFinite(nLat2) ||
    !Number.isFinite(nLon2)
  ) {
    return {
      distanceKm: 0,
      distanceMeters: 0,
      formattedDistance: '0 m'
    };
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(nLat2 - nLat1);
  const dLon = toRad(nLon2 - nLon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(nLat1)) *
      Math.cos(toRad(nLat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  // Clamp 'a' between 0 and 1 to prevent precision errors leading to NaN in Math.sqrt
  const clampedA = Math.max(0, Math.min(1, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  const distanceKm = R * c;
  const distanceMeters = Math.round(distanceKm * 1000);

  let formattedDistance = '';
  if (distanceKm < 1) {
    formattedDistance = `${distanceMeters} m`;
  } else {
    formattedDistance = `${distanceKm.toFixed(1)} km`;
  }

  return {
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    distanceMeters,
    formattedDistance,
  };
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

