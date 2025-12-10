/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LatLng } from '../types.ts';

// SVG definitions for weather icons on the map (using unsafeHTML for injection)
const SunIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const CloudIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`;
const RainIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`;
const SnowIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="8" y1="20" x2="8" y2="20"></line><line x1="12" y1="18" x2="12" y2="18"></line><line x1="12" y1="22" x2="12" y2="22"></line><line x1="16" y1="16" x2="16" y2="16"></line><line x1="16" y1="20" x2="16" y2="20"></line></svg>`;
const StormIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16.65A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="8 16 12 12 12 18 16 14"></polyline></svg>`;
const FogIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12a10.3 10.3 0 0 0-2.3-6.4A10.3 10.3 0 0 0 13.3 2H12a10.3 10.3 0 0 0-6.4 2.3A10.3 10.3 0 0 0 2 12a10.3 10.3 0 0 0 2.3 6.4A10.3 10.3 0 0 0 12 22h1.3a10.3 10.3 0 0 0 6.4-2.3A10.3 10.3 0 0 0 22 12Z"/><path d="M2 12h20"/><path d="M2 12h20"/></svg>`;

export const getWeatherMarkerIcon = (conditionType: string = 'cloudy'): string => {
  const type = conditionType.toLowerCase();
  if (type.includes('clear') || type.includes('sunny')) return SunIconSVG;
  if (type.includes('storm') || type.includes('thunder')) return StormIconSVG;
  if (type.includes('rain') || type.includes('drizzle') || type.includes('shower')) return RainIconSVG;
  if (type.includes('snow') || type.includes('sleet') || type.includes('flurry')) return SnowIconSVG;
  if (type.includes('fog') || type.includes('mist') || type.includes('haze')) return FogIconSVG;
  if (type.includes('cloud')) return CloudIconSVG;
  return CloudIconSVG;
};

export const calculateTiltOffsetLat = (tilt: number, altitude: number): number => {
    // Earth's radius in meters (approximate)
    const EARTH_RADIUS_METERS = 6371000;
    // Meters per degree of latitude (approximate, constant for latitude)
    const METERS_PER_DEGREE_LAT = (2 * Math.PI * EARTH_RADIUS_METERS) / 360;

    // Convert tilt from degrees to radians
    const tiltRad = tilt * (Math.PI / 180);

    // Calculate the horizontal distance (L) on the ground from the camera's nadir
    // to the center point of the view.
    // L = altitude * tan(tilt)
    const groundShiftDistanceMeters = altitude * Math.tan(tiltRad);

    // Convert the ground shift distance to a latitude offset.
    // Since positive tilt shifts the view south (negative latitude), we need a positive offset (north)
    // to compensate and keep the original location in the center of the tilted view.
    const latitudeOffsetDegrees =
      groundShiftDistanceMeters / METERS_PER_DEGREE_LAT;

    return latitudeOffsetDegrees;
};

export const isSameLatLng = (loc1: LatLng | undefined, loc2: LatLng | undefined): boolean => {
    if (!loc1 || !loc2) return false;
    // Use a small epsilon for floating point comparison
    const epsilon = 1e-6;
    return (
      Math.abs(loc1.latitude - loc2.latitude) < epsilon &&
      Math.abs(loc1.longitude - loc2.longitude) < epsilon
    );
};