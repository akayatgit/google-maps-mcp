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

import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/** Error type used for server responses that should be handled gracefully client-side (e.g., 4xx errors). */
class ClientHandledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientHandledError';
  }
}

// Icons using Tabler Icons (replace with your actual icon SVGs)
const CHEVRON_UP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-up" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 15l6 -6l6 6" /></svg>`;
const CHEVRON_DOWN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-down" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 9l6 6l6 -6" /></svg>`;
const GLOBE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-world" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M3.6 9h16.8" /><path d="M3.6 15h16.8" /><path d="M11.5 3a17 17 0 0 0 0 18" /><path d="M12.5 3a17 17 0 0 1 0 18" /></svg>`;
const GOOGLE_MAPS_LOGO = 'public/images/google-maps-platform.svg';

interface Source {
  url: string;
  title?: string;
  publisher?: string;
  logo?: string; // Favicon URL
  image?: string; // OG Image URL (not strictly required for favicon, but useful for rich previews)
  isLoading: boolean;
  error?: boolean;
}

@customElement('source-card')
export class SourceCard extends LitElement {
  @property({ type: Object })
  data: Source = { url: '', isLoading: true };


  static styles = css`
    :host {
      display: inline-block;
    }
    .card-link {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 12rem; /* 192px */
      height: 6rem; /* 128px */
      background-color: #F3F4F6;
      border-radius: 1rem; /* 16px */
      padding: 1rem; /* 16px */
      text-decoration: none;
      transition: background-color 0.2s ease-in-out;
      border: 1px solid transparent;
      color: inherit;
    }
    .card-link:hover {
      background-color: #E5E7EB;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.5rem;  8px */
    }
    .logo {
      width: 1rem; /* 16px */
      height: 1rem; /* 16px */
      border-radius: 9999px;
      object-fit: cover;
    }
    .publisher {
      font-size: 0.75rem; /* 12px */
      color: #6B7280;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .title {
      font-size: 0.875rem; /* 14px */
      font-weight: 600;
      color: #111827;
      line-height: 1.25;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
    .card-link:hover .title {
      color: #000;
    }
    /* Loading and Error States */
    .loading, .error {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .loading span, .error span {
      font-size: 0.75rem;
    }
    .loading {
      background-color: #F9FAFB;
      border: 1px solid #F3F4F6;
    }
    .loading-spinner {
      width: 1.5rem;
      height: 1.5rem;
      margin-bottom: 0.5rem;
      animation: spin 1s linear infinite;
      border: 2px solid #E5E7EB;
      border-top-color: #9CA3AF;
      border-radius: 50%;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error {
      background-color: #FEF2F2;
      border: 1px solid #FEE2E2;
    }
    .error-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: #F87171;
      margin-bottom: 0.5rem;
    }
  `;

  render() {
    if (this.data.isLoading) {
      return html`
        <div class="card-link loading">
          <div class="loading-spinner"></div>
          <span class="text-gray-400">Loading...</span>
        </div>
      `;
    }

    if (this.data.error) {
       return html`
        <div class="card-link error">
          <div class="error-icon">${unsafeHTML(GLOBE_ICON)}</div>
          <span class="text-red-400">Failed to load</span>
        </div>
      `;
    }

    // Custom handling for Google Maps links
    const isGoogleMaps = this.data.url.includes('google.com/maps');
    const displayLogo = isGoogleMaps ? GOOGLE_MAPS_LOGO : this.data.logo;
    const displayPublisher = isGoogleMaps ? 'Google Maps' : this.data.publisher;
    const displayTitle = isGoogleMaps ? 'View on Google Maps' : this.data.title || this.data.url;


    return html`
      <a href=${this.data.url} target="_blank" rel="noopener noreferrer" class="card-link">
        <div class="header">
          ${displayLogo
            ? html`<img src=${displayLogo} alt="" class="logo" @error=${(e: any) => e.target.style.display = 'none'} />`
            : html`<div class="icon-placeholder">${unsafeHTML(GLOBE_ICON)}</div>`
          }
          <span class="publisher">${displayPublisher}</span>
        </div>
        <div class="title-wrapper" style="margin-top: 0.5rem;">
          <h3 class="title">${displayTitle}</h3>
        </div>
      </a>
    `;
  }
}


@customElement('sources-container')
export class SourcesContainer extends LitElement {
  @property({ type: Array })
  urls: string[] = [];

  @property({ type: Array, state: true })
  sources: Source[] = [];

  @property({ type: Boolean, state: true })
  isExpanded: boolean = false;

  @property({ type: Boolean, state: true })
  isLoading: boolean = true;

  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
      margin-top: 1rem;
    }
    .header-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #F3F4F6;
      border: none;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #4B5563;
    }
    .header-button:hover {
      background-color: #E5E7EB;
    }
    .icon {
      color: #6B7280;
    }
    .scroll-container-wrapper {
      transition: all 0.3s ease-in-out;
      overflow: hidden;
      max-height: 0; /* Default collapsed */
      opacity: 0;
    }
    .scroll-container-wrapper.expanded {
      max-height: 20rem; /* Sufficient height for transition */
      opacity: 1;
    }
    .scroll-container {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding: 0.25rem 0.5rem 1.5rem 0.5rem;
      margin: 0 -0.5rem;
      scrollbar-width: none; /* Firefox */
    }
    .scroll-container::-webkit-scrollbar {
      display: none; /* Safari and Chrome */
    }
    .fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  firstUpdated() {
    // Initialization of resources based on properties is handled in updated()
    // updated() is automatically called after firstUpdated due to Lit's lifecycle
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (changedProperties.has('urls')) {
      // Re-process URLs if the input property changes
      this.processUrls();
    }
  }

  /**
   * Fetches metadata from the server's /api/preview endpoint.
   */
  async fetchMetadata(url: string): Promise<Partial<Source>> {
    try {
      // The client-side implementation of fetch is available in modern browsers.
      const response = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          // Use ClientHandledError for 4xx responses (like the 422 we introduced)
          throw new ClientHandledError(`Client handled error! status: ${response.status}`);
        }
        // Throw generic Error for 5xx responses (internal server error)
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const urlObj = new URL(url);
      const host = urlObj.hostname.replace('www.', '');

      return {
        url,
        title: data.title,
        publisher: host,
        logo: data.favicon,
        image: data.image,
        isLoading: false,
        error: false,
      };
    } catch (e) {
      const error = e as Error;

      // Suppress console logging if the error is an expected failure (ClientHandledError)
      // or a standard HTTP response error (4xx or 5xx) where we rely on the fallback logic.
      if (!(error instanceof ClientHandledError) && !error.message.startsWith('HTTP error! status:')) {
        console.error('Failed to fetch link metadata:', error);
      }
      // Fallback to local URL parsing for basic info on error
      try {
        const urlObj = new URL(url);
        return {
            url,
            isLoading: false,
            error: true,
            title: urlObj.hostname,
            publisher: urlObj.hostname.replace('www.', '')
        };
      } catch (_e2) {
        return { url, isLoading: false, error: true, title: 'Invalid Link', publisher: 'Unknown' };
      }
    }
  }

  async processUrls() {
    if (this.urls.length === 0) {
      this.sources = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    // 1. Initialize sources to show loading state immediately
    this.sources = this.urls.map(url => ({ url, isLoading: true }));

    // 2. Fetch all metadata asynchronously
    const fetchPromises = this.urls.map(url => this.fetchMetadata(url));
    const results = await Promise.all(fetchPromises);

    // 3. Update sources with fetched data
    this.sources = results.map(result => ({
        ...result,
        isLoading: false,
        error: result.error || false,
        url: result.url || '',
        title: result.title || result.url || '',
    }) as Source);

    this.isLoading = false;
  }

  toggleExpand(e: Event) {
    e.stopPropagation(); // Stop event from bubbling to parent handlers (e.g., chat-app's handleChatContainerClick)
    this.isExpanded = !this.isExpanded;
    this.dispatchEvent(new CustomEvent('sources-expanded', {
        detail: { isExpanded: this.isExpanded },
        bubbles: true,
        composed: true
    }));
  }

  render() {
    if (this.sources.length === 0) return html``;

    return html`
      <div class="fade-in">
        <button @click=${this.toggleExpand} class="header-button">
          <span>Sources (${this.sources.length})</span>
          <div class="icon">
            ${this.isExpanded ? unsafeHTML(CHEVRON_UP_ICON) : unsafeHTML(CHEVRON_DOWN_ICON)}
          </div>
        </button>

        <div class="scroll-container-wrapper ${this.isExpanded ? 'expanded' : ''}">
          <div class="scroll-container">
            ${this.sources.map(source => html`
              <source-card .data=${source}></source-card>
            `)}
          </div>
        </div>
      </div>
    `;
  }
}