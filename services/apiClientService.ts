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

import { trace } from '../utils/logger.js';
import { LatLng } from '../types.js';

export const forwardGeocodeServer = async (address: string): Promise<LatLng | null> => {
    try {
      const response = await fetch('/api/searchPlaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: address, placeIndex: 0 }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      // We expect the server response to contain a 'location' object within the first place result.
      const place = data?.places?.[0];

      if (place && place.location) {
        return place.location;
      }
      return null;

    } catch (error) {
      console.error("Server-side forward geocoding failed:", error);
      return null;
    }
};

// Wrapper around forwardGeocodeServer to handle logging/error warning
export const geocodeAddress = async (address: string): Promise<LatLng | null> => {
    const location = await forwardGeocodeServer(address);
    if (!location) {
        console.warn(`Forward geocoding via server failed for address: ${address}`);
        return null;
    }
    return location;
};

export const fetchElevationApi = async (locations: LatLng[]): Promise<{ results?: any, error?: string } | null> => {
    if (!locations || locations.length === 0) return null;

    const payload = locations.map(loc => ({ latitude: loc.latitude, longitude: loc.longitude }));

    try {
        trace(`[Elevation API] Calling server endpoint '/api/elevation' for ${locations.length} locations...`);
        const response = await fetch('/api/elevation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locations: payload }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            console.error(`[Elevation API] Server failed to return elevation data. Status: ${response.status}. Error:`, data.error);
            return null;
        }

        // Expected response format: { results: [...] }
        if (data.results) {
            return data;
        }

        console.warn(`[Elevation API] Server returned success but no results in payload:`, data);
        return null;

    } catch (error) {
        console.error("[Elevation API] Fetch to server endpoint failed:", error);
        return null;
    }
};