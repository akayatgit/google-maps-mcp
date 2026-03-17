# MCP Tools Reference: mapstools.googleapis.com

## Tool: `lookup_weather`

Retrieves comprehensive weather data including current conditions, hourly, and daily forecasts. **Specific Data Available:** Temperature (Current, Feels Like, Max/Min, Heat Index), Wind (Speed, Gusts, Direction), Celestial Events (Sunrise/Sunset, Moon Phase), Precipitation (Type, Probability, Quantity/QPF), Atmospheric Conditions (UV Index, Humidity, Cloud Cover, Thunderstorm Probability), and Geocoded Location Address. **Location \& Location Rules (CRITICAL):** The location for which weather data is requested is specified using the 'location' field. This field is a 'oneof' structure, meaning you MUST provide a value for ONLY ONE of the three location sub-fields below to ensure an accurate weather data lookup. 1. Geographic Coordinates (lat_lng) \* Use it when you are provided with exact lat/lng coordinates. \* Example: "lat_lng": { "latitude": 34.0522, "longitude": -118.2437 } // Los Angeles 2. Place ID (place_id) \* An unambiguous string identifier (Google Maps Place ID). \* The place_id can be fetched from the search_places tool. \* Example: "place_id": "ChIJLU7jZClu5kcR4PcOOO6p3I0" // Eiffel Tower 3. Address String (address) \* A free-form string that requires specificity for geocoding. \* City \& Region: Always include region/country (e.g., "London, UK", not "London"). \* Street Address: Provide the full address (e.g., "1600 Pennsylvania Ave NW, Washington, DC"). \* Postal/Zip Codes: MUST be accompanied by a country name (e.g., "90210, USA", NOT "90210"). **Usage Modes:** 1. **Current Weather:** Provide `address` only. Do not specify `date` and `hour`. 2. **Hourly Forecast:** Provide `address`, `date`, and `hour` (0-23). Use for specific times (e.g., "at 5 PM") or terms like 'next few hours' or 'later today.'. If the user specifies minute, round down to the nearest hour. Hourly forecast beyond 48 hours from now is not supported. 3. **Daily Forecast:** Provide `address` and `date`. Do not specify `hour`. Use for general day requests (e.g., "weather for tomorrow", "weather on Friday", "weather on 12/25"). If today's date is not in the context, you should clarify it with the user. Daily forecast beyond 7 days including today is not supported. Historical weather is not supported. **Parameter Constraints:** \* **Timezones:** All `date` and `hour` inputs must be relative to the **location's local time zone** , not the user's time zone. \* **Date Format:** Inputs must be separated into `{year, month, day}` integers. \* **Units:** Defaults to `METRIC`. Set `units_system` to `IMPERIAL` for Fahrenheit/Miles if the user implies US standards or explicitly requests it.

The following sample demonstrate how to use `curl` to invoke the `lookup_weather` MCP tool.

| Curl Request |
|---|
| ```bash curl --location 'https://mapstools.googleapis.com/mcp' \ --header 'content-type: application/json' \ --header 'accept: application/json, text/event-stream' \ --data '{ "method": "tools/call", "params": { "name": "lookup_weather", "arguments": { // provide these details according to the tool's MCP specification } }, "jsonrpc": "2.0", "id": 1 }' ``` |

## Input Schema

Request for the LookupWeather method - represents the weather conditions at the requested location.

### LookupWeatherRequest

| JSON representation |
|---|
| ``` { "DEPRECATEDAddress": string, "unitsSystem": enum (`UnitsSystem`), "location": { object (`Location`) }, // Union field `_date` can be only one of the following: "date": { object (`google.type.Date`) } // End of list of possible types for union field `_date`. // Union field `_hour` can be only one of the following: "hour": integer // End of list of possible types for union field `_hour`. } ``` |

| Fields ||
|---|---|
| `DEPRECATEDAddress (deprecated)` | `string` > [!WARNING] > This item is deprecated! DEPRECATED: Use location instead. |
| `unitsSystem` | ``enum (`UnitsSystem`)`` Optional. The units system to use for the returned weather conditions. If not provided, the returned weather conditions will be in the metric system (default = METRIC). |
| `location` | ``object (`Location`)`` Required. The location to get the weather conditions for. |
| Union field `_date`. `_date` can be only one of the following: ||
| `date` | ``object (`google.type.Date`)`` Optional. The date of the required weather information. Note: This date is relative to the local timezone of the location specified in the location field. The date must be within the next 7 days. |
| Union field `_hour`. `_hour` can be only one of the following: ||
| `hour` | `integer` Optional. The hour of the requested weather information, in 24-hour format (0-23). This value is relative to the local timezone of the location specified in the location field. Hourly forecast is only supported for the next 48 hours from the current time. |

### Date

| JSON representation |
|---|
| ``` { "year": integer, "month": integer, "day": integer } ``` |

| Fields ||
|---|---|
| `year` | `integer` Year of the date. Must be from 1 to 9999, or 0 to specify a date without a year. |
| `month` | `integer` Month of a year. Must be from 1 to 12, or 0 to specify a year without a month and day. |
| `day` | `integer` Day of a month. Must be from 1 to 31 and valid for the year and month, or 0 to specify a year by itself or a year and month where the day isn't significant. |

### Location

| JSON representation |
|---|
| ``` { // Union field `location_type` can be only one of the following: "latLng": { object (`google.type.LatLng`) }, "placeId": string, "address": string // End of list of possible types for union field `location_type`. } ``` |

| Fields ||
|---|---|
| Union field `location_type`. Different ways to represent a location. `location_type` can be only one of the following: ||
| `latLng` | ``object (`google.type.LatLng`)`` A point specified using geographic coordinates. |
| `placeId` | `string` The Place ID associated with the location . |
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

Response for the LookupWeather RPC - represents the weather conditions at the requested location.

This response represent both Hourly and Daily information, therefore the response is split in three sections Hourly, Daily and Shared. Only-Hourly, Only-Daily fields are marked as optional. For fields that are shared between Hourly and Daily information, some are always present so they are not marked as optional while the rest are marked as optional because they are not always available.

### LookupWeatherResponse

| JSON representation |
|---|
| ``` { "weatherCondition": { object (`WeatherCondition`) }, "precipitation": { object (`Precipitation`) }, "wind": { object (`Wind`) }, "DEPRECATEDGeocodedAddress": string, "returnedLocation": { object (`Location`) }, // Union field `_temperature` can be only one of the following: "temperature": { object (`Temperature`) } // End of list of possible types for union field `_temperature`. // Union field `_feels_like_temperature` can be only one of the following: "feelsLikeTemperature": { object (`Temperature`) } // End of list of possible types for union field `_feels_like_temperature`. // Union field `_heat_index` can be only one of the following: "heatIndex": { object (`Temperature`) } // End of list of possible types for union field `_heat_index`. // Union field `_air_pressure` can be only one of the following: "airPressure": { object (`AirPressure`) } // End of list of possible types for union field `_air_pressure`. // Union field `_max_temperature` can be only one of the following: "maxTemperature": { object (`Temperature`) } // End of list of possible types for union field `_max_temperature`. // Union field `_min_temperature` can be only one of the following: "minTemperature": { object (`Temperature`) } // End of list of possible types for union field `_min_temperature`. // Union field `_feels_like_max_temperature` can be only one of the following: "feelsLikeMaxTemperature": { object (`Temperature`) } // End of list of possible types for union field `_feels_like_max_temperature`. // Union field `_feels_like_min_temperature` can be only one of the following: "feelsLikeMinTemperature": { object (`Temperature`) } // End of list of possible types for union field `_feels_like_min_temperature`. // Union field `_max_heat_index` can be only one of the following: "maxHeatIndex": { object (`Temperature`) } // End of list of possible types for union field `_max_heat_index`. // Union field `_sun_events` can be only one of the following: "sunEvents": { object (`SunEvents`) } // End of list of possible types for union field `_sun_events`. // Union field `_moon_events` can be only one of the following: "moonEvents": { object (`MoonEvents`) } // End of list of possible types for union field `_moon_events`. // Union field `_relative_humidity` can be only one of the following: "relativeHumidity": integer // End of list of possible types for union field `_relative_humidity`. // Union field `_uv_index` can be only one of the following: "uvIndex": integer // End of list of possible types for union field `_uv_index`. // Union field `_thunderstorm_probability` can be only one of the following: "thunderstormProbability": integer // End of list of possible types for union field `_thunderstorm_probability`. // Union field `_cloud_cover` can be only one of the following: "cloudCover": integer // End of list of possible types for union field `_cloud_cover`. } ``` |

| Fields ||
|---|---|
| `weatherCondition` | ``object (`WeatherCondition`)`` The weather condition |
| `precipitation` | ``object (`Precipitation`)`` The precipitation probability and amount of precipitation accumulated |
| `wind` | ``object (`Wind`)`` The wind conditions |
| `DEPRECATEDGeocodedAddress (deprecated)` | `string` > [!WARNING] > This item is deprecated! DEPRECATED: Use returned_location instead. |
| `returnedLocation` | ``object (`Location`)`` Required. The location where the weather information is returned. This location is identical to the location in the request, but can be different from it if the requested location is a free text address that looks up to a coarse location (e.g. "Mountain View, CA"). |
| Union field `_temperature`. `_temperature` can be only one of the following: ||
| `temperature` | ``object (`Temperature`)`` The hourly temperature |
| Union field `_feels_like_temperature`. `_feels_like_temperature` can be only one of the following: ||
| `feelsLikeTemperature` | ``object (`Temperature`)`` The hourly measure of how the temperature feels like. |
| Union field `_heat_index`. `_heat_index` can be only one of the following: ||
| `heatIndex` | ``object (`Temperature`)`` The hourly heat index temperature. |
| Union field `_air_pressure`. `_air_pressure` can be only one of the following: ||
| `airPressure` | ``object (`AirPressure`)`` The hourly air pressure conditions. |
| Union field `_max_temperature`. `_max_temperature` can be only one of the following: ||
| `maxTemperature` | ``object (`Temperature`)`` The maximum (high) temperature throughout the day. |
| Union field `_min_temperature`. `_min_temperature` can be only one of the following: ||
| `minTemperature` | ``object (`Temperature`)`` The minimum (low) temperature throughout the day. |
| Union field `_feels_like_max_temperature`. `_feels_like_max_temperature` can be only one of the following: ||
| `feelsLikeMaxTemperature` | ``object (`Temperature`)`` The maximum (high) feels-like temperature throughout the day. |
| Union field `_feels_like_min_temperature`. `_feels_like_min_temperature` can be only one of the following: ||
| `feelsLikeMinTemperature` | ``object (`Temperature`)`` The minimum (low) feels-like temperature throughout the day. |
| Union field `_max_heat_index`. `_max_heat_index` can be only one of the following: ||
| `maxHeatIndex` | ``object (`Temperature`)`` The maximum heat index temperature throughout the day. |
| Union field `_sun_events`. `_sun_events` can be only one of the following: ||
| `sunEvents` | ``object (`SunEvents`)`` The events related to the sun (e.g. sunrise, sunset). |
| Union field `_moon_events`. `_moon_events` can be only one of the following: ||
| `moonEvents` | ``object (`MoonEvents`)`` The events related to the moon (e.g. moonrise, moonset). |
| Union field `_relative_humidity`. `_relative_humidity` can be only one of the following: ||
| `relativeHumidity` | `integer` The percent of relative humidity (values from 0 to 100). define optional because it is not always available |
| Union field `_uv_index`. `_uv_index` can be only one of the following: ||
| `uvIndex` | `integer` The maximum ultraviolet (UV) index. define optional because it is not always available |
| Union field `_thunderstorm_probability`. `_thunderstorm_probability` can be only one of the following: ||
| `thunderstormProbability` | `integer` The thunderstorm probability (values from 0 to 100). define optional because it is not always available |
| Union field `_cloud_cover`. `_cloud_cover` can be only one of the following: ||
| `cloudCover` | `integer` The percentage of the sky covered by clouds (values from 0 to 100). define optional because it is not always available |

### Temperature

| JSON representation |
|---|
| ``` { "unit": enum (`TemperatureUnit`), // Union field `_degrees` can be only one of the following: "degrees": number // End of list of possible types for union field `_degrees`. } ``` |

| Fields ||
|---|---|
| `unit` | ``enum (`TemperatureUnit`)`` The code for the unit used to measure the temperature value. |
| Union field `_degrees`. `_degrees` can be only one of the following: ||
| `degrees` | `number` The temperature value (in degrees) in the specified unit. |

### AirPressure

| JSON representation |
|---|
| ``` { // Union field `_mean_sea_level_millibars` can be only one of the following: "meanSeaLevelMillibars": number // End of list of possible types for union field `_mean_sea_level_millibars`. } ``` |

| Fields ||
|---|---|
| Union field `_mean_sea_level_millibars`. `_mean_sea_level_millibars` can be only one of the following: ||
| `meanSeaLevelMillibars` | `number` The mean sea level air pressure in millibars. |

### SunEvents

| JSON representation |
|---|
| ``` { "sunriseTime": string, "sunsetTime": string } ``` |

| Fields ||
|---|---|
| `sunriseTime` | ``string (`https://protobuf.dev/reference/protobuf/google.protobuf#timestamp` format)`` The time when the sun rises. NOTE: In some unique cases (e.g. north of the artic circle) there may be no sunrise time for a day. In these cases, this field will be unset. Uses RFC 3339, where generated output will always be Z-normalized and use 0, 3, 6 or 9 fractional digits. Offsets other than "Z" are also accepted. Examples: `"2014-10-02T15:01:23Z"`, `"2014-10-02T15:01:23.045123456Z"` or `"2014-10-02T15:01:23+05:30"`. |
| `sunsetTime` | ``string (`https://protobuf.dev/reference/protobuf/google.protobuf#timestamp` format)`` The time when the sun sets. NOTE: In some unique cases (e.g. north of the artic circle) there may be no sunset time for a day. In these cases, this field will be unset. Uses RFC 3339, where generated output will always be Z-normalized and use 0, 3, 6 or 9 fractional digits. Offsets other than "Z" are also accepted. Examples: `"2014-10-02T15:01:23Z"`, `"2014-10-02T15:01:23.045123456Z"` or `"2014-10-02T15:01:23+05:30"`. |

### Timestamp

| JSON representation |
|---|
| ``` { "seconds": string, "nanos": integer } ``` |

| Fields ||
|---|---|
| `seconds` | `string (https://developers.google.com/discovery/v1/type-format format)` Represents seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z. Must be between -62135596800 and 253402300799 inclusive (which corresponds to 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z). |
| `nanos` | `integer` Non-negative fractions of a second at nanosecond resolution. This field is the nanosecond portion of the duration, not an alternative to seconds. Negative second values with fractions must still have non-negative nanos values that count forward in time. Must be between 0 and 999,999,999 inclusive. |

### MoonEvents

| JSON representation |
|---|
| ``` { "moonriseTimes": [ string ], "moonsetTimes": [ string ], "moonPhase": enum (`MoonPhase`) } ``` |

| Fields ||
|---|---|
| `moonriseTimes[]` | ``string (`https://protobuf.dev/reference/protobuf/google.protobuf#timestamp` format)`` The time when the upper limb of the moon appears above the horizon (see <https://en.wikipedia.org/wiki/Moonrise_and_moonset)>. NOTE: For most cases, there'll be a single moon rise time per day. In other cases, the list might be empty (e.g. when the moon rises after next day midnight). However, in unique cases (e.g. in polar regions), the list may contain more than one value. In these cases, the values are sorted in ascending order. Uses RFC 3339, where generated output will always be Z-normalized and use 0, 3, 6 or 9 fractional digits. Offsets other than "Z" are also accepted. Examples: `"2014-10-02T15:01:23Z"`, `"2014-10-02T15:01:23.045123456Z"` or `"2014-10-02T15:01:23+05:30"`. |
| `moonsetTimes[]` | ``string (`https://protobuf.dev/reference/protobuf/google.protobuf#timestamp` format)`` The time when the upper limb of the moon disappears below the horizon (see <https://en.wikipedia.org/wiki/Moonrise_and_moonset)>. NOTE: For most cases, there'll be a single moon set time per day. In other cases, the list might be empty (e.g. when the moon sets after next day midnight). However, in unique cases (e.g. in polar regions), the list may contain more than one value. In these cases, the values are sorted in ascending order. Uses RFC 3339, where generated output will always be Z-normalized and use 0, 3, 6 or 9 fractional digits. Offsets other than "Z" are also accepted. Examples: `"2014-10-02T15:01:23Z"`, `"2014-10-02T15:01:23.045123456Z"` or `"2014-10-02T15:01:23+05:30"`. |
| `moonPhase` | ``enum (`MoonPhase`)`` The moon phase (a.k.a. lunar phase). |

### WeatherCondition

| JSON representation |
|---|
| ``` { "iconBaseUri": string, "description": { object (`google.type.LocalizedText`) }, "type": enum (`Type`) } ``` |

| Fields ||
|---|---|
| `iconBaseUri` | `string` The base URI for the icon not including the file type extension. To display the icon, append a theme if desired and the file type extension (`.png` or `.svg`) to this URI. By default, the icon is light themed, but `_dark` can be appended for dark mode. For example: "https://maps.gstatic.com/weather/v1/dust.svg" or "https://maps.gstatic.com/weather/v1/dust_dark.svg", where `icon_base_uri` is "https://maps.gstatic.com/weather/v1/dust". |
| `description` | ``object (`google.type.LocalizedText`)`` The textual description for this weather condition (localized). |
| `type` | ``enum (`Type`)`` The type of weather condition. |

### LocalizedText

| JSON representation |
|---|
| ``` { "text": string, "languageCode": string } ``` |

| Fields ||
|---|---|
| `text` | `string` Localized string in the language corresponding to `google.type.LocalizedText.language_code` below. |
| `languageCode` | `string` The text's BCP-47 language code, such as "en-US" or "sr-Latn". For more information, see <http://www.unicode.org/reports/tr35/#Unicode_locale_identifier>. |

### Precipitation

| JSON representation |
|---|
| ``` { "probability": { object (`PrecipitationProbability`) }, "snowQpf": { object (`QuantitativePrecipitationForecast`) }, "qpf": { object (`QuantitativePrecipitationForecast`) } } ``` |

| Fields ||
|---|---|
| `probability` | ``object (`PrecipitationProbability`)`` The probability of precipitation (values from 0 to 100). |
| `snowQpf` | ``object (`QuantitativePrecipitationForecast`)`` The amount of snow, measured as liquid water equivalent, that has accumulated over a period of time. Note: QPF is an abbreviation for Quantitative Precipitation Forecast (please see the QuantitativePrecipitationForecast definition for more details). |
| `qpf` | ``object (`QuantitativePrecipitationForecast`)`` The amount of precipitation rain, measured as liquid water equivalent, that has accumulated over a period of time. Note: QPF is an abbreviation for Quantitative Precipitation Forecast (please see the QuantitativePrecipitationForecast definition for more details). |

### PrecipitationProbability

| JSON representation |
|---|
| ``` { "type": enum (`PrecipitationType`), // Union field `_percent` can be only one of the following: "percent": integer // End of list of possible types for union field `_percent`. } ``` |

| Fields ||
|---|---|
| `type` | ``enum (`PrecipitationType`)`` A code that indicates the type of precipitation. |
| Union field `_percent`. `_percent` can be only one of the following: ||
| `percent` | `integer` A percentage from 0 to 100 that indicates the chances of precipitation. |

### QuantitativePrecipitationForecast

| JSON representation |
|---|
| ``` { "unit": enum (`Unit`), // Union field `_quantity` can be only one of the following: "quantity": number // End of list of possible types for union field `_quantity`. } ``` |

| Fields ||
|---|---|
| `unit` | ``enum (`Unit`)`` The code of the unit used to measure the amount of accumulated precipitation. |
| Union field `_quantity`. `_quantity` can be only one of the following: ||
| `quantity` | `number` The amount of precipitation, measured as liquid water equivalent, that has accumulated over a period of time. |

### Wind

| JSON representation |
|---|
| ``` { "direction": { object (`WindDirection`) }, "speed": { object (`WindSpeed`) }, "gust": { object (`WindSpeed`) } } ``` |

| Fields ||
|---|---|
| `direction` | ``object (`WindDirection`)`` The direction of the wind, the angle it is coming from. |
| `speed` | ``object (`WindSpeed`)`` The speed of the wind. |
| `gust` | ``object (`WindSpeed`)`` The wind gust (sudden increase in the wind speed). |

### WindDirection

| JSON representation |
|---|
| ``` { "cardinal": enum (`CardinalDirection`), // Union field `_degrees` can be only one of the following: "degrees": integer // End of list of possible types for union field `_degrees`. } ``` |

| Fields ||
|---|---|
| `cardinal` | ``enum (`CardinalDirection`)`` The code that represents the cardinal direction from which the wind is blowing. |
| Union field `_degrees`. `_degrees` can be only one of the following: ||
| `degrees` | `integer` The direction of the wind in degrees (values from 0 to 360). |

### WindSpeed

| JSON representation |
|---|
| ``` { "unit": enum (`SpeedUnit`), // Union field `_value` can be only one of the following: "value": number // End of list of possible types for union field `_value`. } ``` |

| Fields ||
|---|---|
| `unit` | ``enum (`SpeedUnit`)`` The code that represents the unit used to measure the wind speed. |
| Union field `_value`. `_value` can be only one of the following: ||
| `value` | `number` The value of the wind speed. |

### Location

| JSON representation |
|---|
| ``` { // Union field `location_type` can be only one of the following: "latLng": { object (`google.type.LatLng`) }, "placeId": string, "address": string // End of list of possible types for union field `location_type`. } ``` |

| Fields ||
|---|---|
| Union field `location_type`. Different ways to represent a location. `location_type` can be only one of the following: ||
| `latLng` | ``object (`google.type.LatLng`)`` A point specified using geographic coordinates. |
| `placeId` | `string` The Place ID associated with the location . |
| `address` | `string` Human readable address or a plus code. See <https://plus.codes> for details. |

### LatLng

| JSON representation |
|---|
| ``` { "latitude": number, "longitude": number } ``` |

| Fields ||
|---|---|
| `latitude` | `number` The latitude in degrees. It must be in the range \[-90.0, +90.0\]. |
| `longitude` | `number` The longitude in degrees. It must be in the range \[-180.0, +180.0\]. |

### Tool Annotations

Destructive Hint: ❌ \| Idempotent Hint: ❌ \| Read Only Hint: ✅ \| Open World Hint: ❌