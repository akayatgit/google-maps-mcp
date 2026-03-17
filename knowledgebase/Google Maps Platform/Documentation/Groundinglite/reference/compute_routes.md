# MCP Tools Reference: mapstools.googleapis.com

## Tool: `compute_routes`

Computes a travel route between a specified origin and destination. **Supported Travel Modes:** DRIVE (default), WALK.

**Input Requirements (CRITICAL):** Requires both **origin** and **destination**. Each must be provided using one of the following methods, nested within its respective field:

- **address:** (string, e.g., 'Eiffel Tower, Paris'). Note: The more granular or specific the input address is, the better the results will be.

- **lat_lng:** (object, {"latitude": number, "longitude": number})

- **place_id:** (string, e.g., 'ChIJOwE_Id1w5EAR4Q27FkL6T_0') Note: This id can be obtained from the search_places tool. Any combination of input types is allowed (e.g., origin by address, destination by lat_lng). If either the origin or destination is missing, **you MUST ask the user for clarification** before attempting to call the tool.

**Example Tool Call:** {"origin":{"address":"Eiffel Tower"},"destination":{"place_id":"ChIJt_5xIthw5EARoJ71mGq7t74"},"travel_mode":"DRIVE"}

The following sample demonstrate how to use `curl` to invoke the `compute_routes` MCP tool.

| Curl Request |
|---|
| ```bash curl --location 'https://mapstools.googleapis.com/mcp' \ --header 'content-type: application/json' \ --header 'accept: application/json, text/event-stream' \ --data '{ "method": "tools/call", "params": { "name": "compute_routes", "arguments": { // provide these details according to the tool's MCP specification } }, "jsonrpc": "2.0", "id": 1 }' ``` |

## Input Schema

ComputeRoutesRequest.

### ComputeRoutesRequest

| JSON representation |
|---|
| ``` { "origin": { object (`Waypoint`) }, "destination": { object (`Waypoint`) }, "travelMode": enum (`RouteTravelMode`) } ``` |

| Fields ||
|---|---|
| `origin` | ``object (`Waypoint`)`` Required. Origin waypoint. |
| `destination` | ``object (`Waypoint`)`` Required. Destination waypoint. |
| `travelMode` | ``enum (`RouteTravelMode`)`` Optional. Specifies the mode of transportation. |

### Waypoint

| JSON representation |
|---|
| ``` { // Union field `location_type` can be only one of the following: "latLng": { object (`google.type.LatLng`) }, "placeId": string, "address": string // End of list of possible types for union field `location_type`. } ``` |

| Fields ||
|---|---|
| Union field `location_type`. Different ways to represent a location. `location_type` can be only one of the following: ||
| `latLng` | ``object (`google.type.LatLng`)`` A point specified using geographic coordinates. |
| `placeId` | `string` The Place ID associated with the waypoint. |
| `address` | `string` Human readable address or a plus code. See <https://plus.codes> for details. |

### LatLng

| JSON representation |
|---|
| ``` { "latitude": number, "longitude": number } ``` |

| Fields ||
|---|---|
| `latitude` | `number` The latitude in degrees. It must be in the range \[-90.0, +90.0\]. |
| `longitude` | `number` The longitude in degrees. It must be in the range \[-180.0, +180.0\]. |

## Output Schema

ComputeRoutesResponse.

### ComputeRoutesResponse

| JSON representation |
|---|
| ``` { "routes": [ { object (`Route`) } ] } ``` |

| Fields ||
|---|---|
| `routes[]` | ``object (`Route`)`` Contains routes between the requested origin and destination. Currently only one route is returned. |

### Route

| JSON representation |
|---|
| ``` { "distanceMeters": integer, "duration": string } ``` |

| Fields ||
|---|---|
| `distanceMeters` | `integer` The travel distance of the route, in meters. |
| `duration` | ``string (`https://protobuf.dev/reference/protobuf/google.protobuf#duration` format)`` The length of time needed to navigate the route. A duration in seconds with up to nine fractional digits, ending with '`s`'. Example: `"3.5s"`. |

### Duration

| JSON representation |
|---|
| ``` { "seconds": string, "nanos": integer } ``` |

| Fields ||
|---|---|
| `seconds` | `string (https://developers.google.com/discovery/v1/type-format format)` Signed seconds of the span of time. Must be from -315,576,000,000 to +315,576,000,000 inclusive. Note: these bounds are computed from: 60 sec/min \* 60 min/hr \* 24 hr/day \* 365.25 days/year \* 10000 years |
| `nanos` | `integer` Signed fractions of a second at nanosecond resolution of the span of time. Durations less than one second are represented with a 0 `seconds` field and a positive or negative `nanos` field. For durations of one second or more, a non-zero value for the `nanos` field must be of the same sign as the `seconds` field. Must be from -999,999,999 to +999,999,999 inclusive. |

### Tool Annotations

Destructive Hint: ❌ \| Idempotent Hint: ❌ \| Read Only Hint: ✅ \| Open World Hint: ❌