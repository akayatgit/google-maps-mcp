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

/**
 * Service layer for interacting with both the Model Context Protocol (MCP) server
 * and complementary Google Maps Platform APIs.
 *
 * Functions utilizing the MCP server are defined first, followed by direct API calls.
 */

import { trace } from '../utils/logger.js';
import { Place, WeatherData, GoogleDate, RouteData, RouteWaypoint, TravelMode, LatLng, WeatherLocationInput } from '../types.js';
import { marked } from 'marked';
import { callRoutesApiV2, getPlaceDetailsReal, findPlaceByLatLng } from './complementaryServices.js';

import { mcpClientInstance } from './conversationalAIService.js';
// --- CORE MCP TOOL LOGIC ---

/**
 * Executes a tool call using the established McpClient instance.
 * @param method The tool name (e.g., 'search_places', 'lookup_weather').
 * @param params The arguments for the tool.
 * @param fieldMask Optional X-Goog-FieldMask header value (ignored by client SDK).
 */
async function callMcpTool(
  method: string,
  params: Record<string, any>,
  fieldMask?: string // Keeping signature for minimal changes below
): Promise<{ result?: any, status?: number, rawBody?: any }> {
  if (!mcpClientInstance) {
    const error = 'MCP Client is not initialized.';
    console.error(`Error calling MCP tool ${method}:`, error);
    return { status: 500, rawBody: { error: error } };
  }

  try {
    trace(`[MCP] Calling tool ${method} with params:`, params);

    // The MCP client SDK handles RPC framing.
    // tool().call() returns the result object.
    const result = await mcpClientInstance.callTool({
      name: method,
      arguments: params,
    });

    // In the previous manual implementation, the JSON-RPC 'result' contained a 'structuredContent' property.
    // We return the result wrapped in 'result' to match the destructuring expected by searchPlacesReal/lookupWeather.
    trace(`[MCP] Raw result from SDK tool call:`, JSON.stringify(result, null, 2));
    return { result };

  } catch (error) {
    console.error(`Error calling MCP tool ${method}:`, error);
    // Errors from the SDK typically don't expose status/rawBody cleanly, just error message.
    const errorMessage = error instanceof Error ? error.message : "Unknown MCP error.";

    // Attempt to extract status if possible from the error object, defaulting to 500
    const status = (error as any).status || 500;
    return { status: status, rawBody: { error: errorMessage } };
  }
}



// --- CORE MCP LOGIC (Wrappers & Essential APIs) ---

export const searchPlacesReal = async (query: string, locationBias?: LatLng, _placeIndex = 0): Promise<{ places?: Place[], summary?: string, error?: string, status?: number, rawBody?: any }> => {
  try {
    const params: Record<string, any> = {
      text_query: query,
    };

    if (locationBias) {
      params.location_bias = {
        circle: {
          center: {
            latitude: locationBias.latitude,
            longitude: locationBias.longitude,
          },
        },
      };
    }

    const { result, status, rawBody } = await callMcpTool('search_places', params);

    if (status) {
      // MCP call failed (non-2xx response)
      return { error: `MCP call failed with status ${status}`, status, rawBody };
    }

    // The result structure is nested under structuredContent in the legacy API,
    // or inside content[0].text as JSON in standard MCP tool calls.
    let structuredContent = result.structuredContent || {};

    if (!structuredContent.places && result.content && Array.isArray(result.content)) {
      const textContent = result.content.find((c: any) => c.type === 'text');
      if (textContent && textContent.text) {
        try {
          const parsed = JSON.parse(textContent.text);
          // Check if parsed content has the expected structure (response.places or just places)
          if (parsed.response && parsed.response.places) {
             structuredContent = parsed.response;
          } else if (parsed.places) {
             structuredContent = parsed;
          }
        } catch (e) {
          console.warn("Failed to parse tool content text as JSON:", e);
        }
      }
    }

    const validPlaces = structuredContent.places?.filter((p: Place) => p.id && p.location) || [];

    let summary = structuredContent.summary;


    // Always run the summary through the formatter to ensure consistent cleanup and filtering
    // of internal monologue, regardless of whether it's already HTML or not.
    const finalSummary = summary ? marked.parse(summary) as string : '';
    return { places: validPlaces, summary: finalSummary };

  } catch (error) {
    // Check if the error object has status/rawBody injected by callMcpTool
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const e = error as { status: number, rawBody: any };
      return { error: `MCP call failed with status ${e.status}`, status: e.status, rawBody: e.rawBody };
    }
    if (error instanceof Error) {
      return { error: `Failed to search places: ${error.message}` };
    }
    return { error: "Failed to search places due to an unknown error." };
  }
};


export const lookupWeather = async (
  locationInput: WeatherLocationInput,
  unitsSystem: 'IMPERIAL' | 'METRIC' = 'IMPERIAL',
  date?: GoogleDate,
  hour?: number
): Promise<{ data?: WeatherData, error?: string, status?: number, rawBody?: any }> => {
  try {
    const params: Record<string, any> = {
      location: locationInput,
      units_system: unitsSystem,
    };

    if (date) {
      params.date = date;
    }
    if (hour !== undefined && hour !== null) {
      params.hour = hour;
    }

    const { result, status, rawBody } = await callMcpTool('lookup_weather', params);

    if (status) {
      // MCP call failed (non-2xx response)
      return { error: `MCP call failed with status ${status}`, status, rawBody };
    }

    // The result structure is expected to be nested under structuredContent or content[0].text
    let structuredContent = result.structuredContent || {};

    if (!structuredContent.returnedLocation && result.content && Array.isArray(result.content)) {
      const textContent = result.content.find((c: any) => c.type === 'text');
      if (textContent && textContent.text) {
        try {
          const parsed = JSON.parse(textContent.text);
          if (parsed.response && parsed.response.returnedLocation) {
             structuredContent = parsed.response;
          } else if (parsed.returnedLocation) {
             structuredContent = parsed;
          }
        } catch (e) {
          console.warn("Failed to parse weather tool content text as JSON:", e);
        }
      }
    }

    // structuredContent should contain the WeatherData object
    const weatherData = structuredContent as WeatherData;

    // Extract location coordinates from the response for map centering
    if (weatherData.returnedLocation?.placeId && !weatherData.returnedLocation?.latLng) {
      trace(`[lookupWeather] Resolving place details for placeId: ${weatherData.returnedLocation.placeId}`);
      const { place, error } = await getPlaceDetailsReal(weatherData.returnedLocation.placeId);

      if (place && place.location) {
        weatherData.returnedLocation.latLng = place.location;
        // Optionally update other fields if needed, like name
        weatherData.returnedLocation.name = place.displayName?.text || place.formattedAddress;
        trace(`[lookupWeather] Resolved place location:`, place.location);
      } else if (error) {
        console.warn(`[lookupWeather] Failed to resolve place details for weather location: ${error}`);
      }
    }

    if (weatherData.returnedLocation?.latLng) {
      weatherData.locationCoords = weatherData.returnedLocation.latLng as LatLng;
    }

    return { data: weatherData };

  } catch (error) {
    if (error instanceof Error) {
      return { error: `Failed to fetch weather: ${error.message}` };
    }
    return { error: "Failed to fetch weather due to an unknown error." };
  }
};

export const computeRoutes = async (
  origin: RouteWaypoint,
  destination: RouteWaypoint,
  travelMode?: TravelMode
): Promise<{ data?: RouteData, error?: string, status?: number, rawBody?: any }> => {
  try {
    trace(`[computeRoutes] Input arguments: origin=`, origin, `destination=`, destination, `travelMode=`, travelMode);
    // Helper to resolve address to place_id or lat_lng if only address is provided
    const resolveWaypoint = async (waypoint: RouteWaypoint): Promise<RouteWaypoint> => {
      // Case 1: place_id is provided. Fetch details to get the name.
      if (waypoint.place_id) {
        trace(`[Routes] Resolving place_id: ${waypoint.place_id}`);
        const { place, error } = await getPlaceDetailsReal(waypoint.place_id);
        if (place) {
          trace(`[Routes] Resolved place details for ${waypoint.place_id}: ${place.displayName?.text}`);
          return {
            ...waypoint,
            name: place.displayName?.text || place.formattedAddress || waypoint.name,
            address: place.formattedAddress || waypoint.address,
            lat_lng: place.location || waypoint.lat_lng,
          };
        } else {
          console.warn(`[Routes] Failed to resolve details for place_id ${waypoint.place_id}: ${error}`);
        }
      }

      // Case 2: lat_lng is provided (and no place_id). Reverse geocode to get name/address.
      if (waypoint.lat_lng && !waypoint.place_id) {
        const latLngString = `${waypoint.lat_lng.latitude},${waypoint.lat_lng.longitude}`;
        trace(`[Routes] Resolving lat_lng: ${latLngString}`);
        // Use findPlaceByLatLng to reverse geocode (find nearest place)
        const { place: resolvedPlace, error } = await findPlaceByLatLng(waypoint.lat_lng);
        if (resolvedPlace) {
          trace(`[Routes] Resolved lat_lng to place: ${resolvedPlace.displayName?.text}`);
          return {
            ...waypoint,
            place_id: resolvedPlace.id,
            name: resolvedPlace.displayName?.text || resolvedPlace.formattedAddress || waypoint.name,
            address: resolvedPlace.formattedAddress || waypoint.address,
          };
        } else {
          console.warn(`[Routes] Failed to resolve lat_lng ${latLngString}: ${error}`);
        }
        console.warn(`[Routes] Failed to resolve lat_lng: ${latLngString}`);
      }

      // Case 3: Only address is provided. Geocode to get place_id and lat_lng.
      if (waypoint.address && !waypoint.place_id && !waypoint.lat_lng) {
        trace(`[Routes] Resolving address: ${waypoint.address}`);
        // Use searchPlacesReal to geocode the address
        const result = await searchPlacesReal(waypoint.address);
        if (result.places && result.places.length > 0) {
          const resolvedPlace = result.places[0];
          trace(`[Routes] Resolved to place_id: ${resolvedPlace.id}`);
          return {
            place_id: resolvedPlace.id,
            lat_lng: resolvedPlace.location,
            name: resolvedPlace.displayName?.text || resolvedPlace.formattedAddress || waypoint.address, // Extract human-readable name, fall back to formatted address, then original address
            address: waypoint.address, // Keep original address for context
          };
        }
        console.warn(`[Routes] Failed to resolve address: ${waypoint.address}`);
      }

      return waypoint;
    };

    const resolvedOrigin = await resolveWaypoint(origin);
    const resolvedDestination = await resolveWaypoint(destination);

    const transformWaypoint = (waypoint: RouteWaypoint) => {
      const transformed: Record<string, any> = {};
      // Prioritize placeId or latLng for external API call.
      if (waypoint.place_id) {
        // Use standalone placeId field for origin/destination
        transformed.placeId = waypoint.place_id;
      } else if (waypoint.lat_lng) {
        // Wrap latLng in a location object, as required by Routes API V2
        transformed.location = {
          latLng: {
            latitude: waypoint.lat_lng.latitude,
            longitude: waypoint.lat_lng.longitude,
          }
        };
      } else if (waypoint.address) {
        // Fallback to address if resolution failed, though this is likely to fail the external API call
        transformed.address = waypoint.address;
      }
      return transformed;
    };

    const params: Record<string, any> = {
      origin: transformWaypoint(resolvedOrigin),
      destination: transformWaypoint(resolvedDestination),
    };


    trace(`[computeRoutes] Final Routes API payload arguments:`, params);

    if (travelMode) {
      params.travelMode = travelMode; // Corrected to use 'travelMode' for Routes V2 API
    }

    // Add required/recommended V2 parameters based on user's feedback/example
    // routingPreference is only valid for travelMode=DRIVE (or when unspecified) and causes errors for WALK/TWO_WHEELER.
    if (travelMode === 'DRIVE' || !travelMode) {
      params.routingPreference = 'TRAFFIC_AWARE';
    }
    params.computeAlternativeRoutes = false;
    params.routeModifiers = {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false,
    };
    params.languageCode = 'en-US';
    params.units = 'METRIC'; // Use METRIC as a default

    const { data, error, status, rawBody } = await callRoutesApiV2(params);

    if (error) {
      // Handle error from the API call utility
      return { error, status, rawBody };
    }

    // Success response structure is nested under data
    const routes = data.routes || [];

    if (routes && routes.length > 0) {
        const route = routes[0];
        // Duration is expected to be a string (e.g., "3600s")
        const encodedPolyline = route.polyline?.encodedPolyline;

        if (!encodedPolyline) {
          console.error('[Routes API] Route found but encodedPolyline is missing. Cannot render route.');
          return { error: 'Route calculation succeeded, but the route data is incomplete (missing polyline).' };
        }

        return {
          data: {
            distanceMeters: route.distanceMeters,
            duration: route.duration,
            origin: resolvedOrigin,
            destination: resolvedDestination,
            travelMode: travelMode,
            encodedPolyline: encodedPolyline
          }
        };
    }

    // If no routes are found
    return { error: "No routes found between the specified locations." };

  } catch (error) {
    if (error instanceof Error) {
      return { error: `Failed to compute routes: ${error.message}` };
    }
    return { error: "Failed to compute routes due to an unknown error." };
  }
};
