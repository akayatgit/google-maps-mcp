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

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { WeatherData } from '../types';

// Default icon fallback
const DefaultIcon = html`<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`;

@customElement('weather-display')
export class WeatherDisplay extends LitElement {
  // We use `property` to define reactive properties passed from the parent
  @property({ type: Object })
  weather: WeatherData | null = null;

  // Optional: Disable shadow DOM if we rely heavily on global CSS (like Tailwind)
  // We will use light DOM for simplicity with Tailwind.
  protected createRenderRoot() {
    return this;
  }

  render() {
    if (!this.weather) return html``;

    const { temperature, feelsLikeTemperature, weatherCondition, wind, relativeHumidity, uvIndex, returnedLocation, minTemperature, maxTemperature } = this.weather;
    const addressToDisplay = returnedLocation?.address;

    const iconBaseUri = weatherCondition?.iconBaseUri;
    const icon = iconBaseUri
        ? html`<img src=${iconBaseUri + '.svg'} alt=${weatherCondition?.type || 'Weather icon'} class="h-10 w-10" />`
        : DefaultIcon;
    const conditionText = weatherCondition?.description?.text || 'Weather data unavailable';

    return html`
      <div class="border border-blue-200/50 bg-blue-50/50 rounded-lg p-3 mb-2 text-[#1A1C1E] text-sm font-sans" aria-label=${`Weather details for ${addressToDisplay || 'the specified location'}`}>
        ${addressToDisplay ? html`<p class="font-semibold text-base text-[#001F2A] truncate" title=${addressToDisplay}>${addressToDisplay}</p>` : ''}
        <div class="flex items-center justify-between mt-1">
          <div class="flex items-center space-x-3">
            <div class="text-[#006780] flex-shrink-0" aria-label=${weatherCondition?.type || ''}>${icon}</div>
            <div>
              ${temperature ? html`
                <p class="text-xl sm:text-2xl font-bold">${Math.round(temperature.degrees)}&deg;${temperature.unit.charAt(0)}</p>
              ` : ''}
              ${minTemperature && maxTemperature && (minTemperature.degrees !== maxTemperature.degrees) ? html`
                <p class="text-xs text-[#42474E] mt-1">Min: ${Math.round(minTemperature.degrees)}&deg; / Max: ${Math.round(maxTemperature.degrees)}&deg;</p>
              ` : ''}
              <p class="capitalize text-xs text-[#42474E]">${conditionText}</p>
            </div>
          </div>
          <div class="text-right text-xs text-[#42474E] space-y-0.5 flex-shrink-0 pl-2">
            ${feelsLikeTemperature ? html`<p>Feels like ${Math.round(feelsLikeTemperature.degrees)}&deg;</p>` : ''}
            ${typeof relativeHumidity === 'number' ? html`<p>Humidity: ${relativeHumidity}%</p>` : ''}
            ${typeof uvIndex === 'number' ? html`<p>UV Index: ${uvIndex}</p>` : ''}
            ${wind && wind.direction && wind.speed ? html`
              <p class="wind-value">Wind: ${Math.round(wind.speed.value)} ${wind.speed.unit === 'MILES_PER_HOUR' ? 'mph' : 'kmh'}</p>
              <p class="wind-value">${wind.direction.cardinal}</p>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}