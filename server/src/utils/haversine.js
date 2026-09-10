/**
 * Calculates the Haversine distance between two points on the Earth.
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {{ distanceKm: number, distanceMeters: number, formattedDistance: string }}
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
