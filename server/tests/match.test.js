import { getDistance } from '../src/utils.js';

describe('Match Utility Functions', () => {
  describe('getDistance (Haversine Formula)', () => {
    it('should correctly calculate the distance between New York and London', () => {
      // Coordinates
      const nyLat = 40.7128;
      const nyLon = -74.0060;
      const londonLat = 51.5074;
      const londonLon = -0.1278;

      const distance = getDistance(nyLat, nyLon, londonLat, londonLon);
      
      // Real distance is ~5570 km
      expect(Math.round(distance)).toBeGreaterThan(5500);
      expect(Math.round(distance)).toBeLessThan(5650);
    });

    it('should return 0 when the coordinates are identical', () => {
      const lat = 40.7128;
      const lon = -74.0060;

      const distance = getDistance(lat, lon, lat, lon);
      expect(distance).toBe(0);
    });

    it('should return Infinity if any coordinate is missing', () => {
      expect(getDistance(null, -74.0060, 51.5074, -0.1278)).toBe(Infinity);
      expect(getDistance(40.7128, undefined, 51.5074, -0.1278)).toBe(Infinity);
      expect(getDistance(40.7128, -74.0060, null, -0.1278)).toBe(Infinity);
    });
  });
});
