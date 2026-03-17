> [!WARNING]
> **Experimental:** Grounding Lite is in the Experimental (pre-GA) stage. Pre-GA products and features might have limited support, and changes to pre-GA products and features might not be compatible with other pre-GA versions. Pre-GA Offerings are covered by the [Google Maps Platform Service Specific
> Terms](https://cloud.google.com/maps-platform/terms/maps-service-terms). For more information, see the [launch stage
> descriptions](https://developers.google.com/maps/launch-stages). There is no charge for using Grounding Lite while it is in Experimental.

Google Maps Platform Grounding Lite is a service with Model Context Protocol
(MCP) support that makes it easy to ground your AI applications with trusted
geospatial data from Google Maps. The MCP server provides tools that allow LLMs
to access capabilities for places, weather, and routes. You can try out
Grounding Lite by enabling it in any tool that supports MCP servers.

## Tools

Grounding Lite provides tools that allow LLMs to access the following Google
Maps capabilities:

- [**Search places**](https://developers.google.com/maps/ai/grounding-lite/reference/mcp/search_places): Request information about places and get AI-generated place data summaries, as well as Place IDs, latitude and longitude coordinates, and Google Maps links for each of the places included in the summary. You can use the returned Place IDs and latitude and longitude coordinates with other Google Maps Platform APIs to show places on a map.
- [**Lookup weather**](https://developers.google.com/maps/ai/grounding-lite/reference/mcp/lookup_weather): Request information about weather and return current conditions, hourly forecasts, and daily forecasts.
- [**Compute routes**](https://developers.google.com/maps/ai/grounding-lite/reference/mcp/compute_routes):
  Request information about driving or walking routes between two locations
  and return route distance and duration information.

  > [!NOTE]
  > **Note:** Grounding Lite does not provide step-by-step routing, directions, real-time traffic, or navigation information

Enabling the Maps Grounding Lite MCP server allows LLMs to call the new tools
exposed by the server to return additional grounding information for the data
types listed above. While the LLM can use this additional information for
context, the response that the LLM ultimately generates may not include the
exact information returned by the MCP server. You should verify the accuracy of
the generated response.

## Try the Grounding Lite sample app [(Open in a new tab)](https://grounding-lite-app-302254163709.us-central1.run.app/)

<iframe style="width:100%; height:660px !important" src="https://grounding-lite-app-302254163709.us-central1.run.app/"></iframe>

## Billing and quotas

There is no charge for using Grounding Lite while it is Experimental. However,
the following quotas apply to the tools provided by Grounding Lite:

- **Search places**: 100 queries per minute, per project. 1,000 queries per day, per project.
- **Lookup weather**: 300 queries per minute, per project.
- **Compute routes**: 300 queries per minute, per project.

## Policies and terms of service

Grounding Lite is subject to the [Google Maps Platform Terms of
Service](https://cloud.google.com/maps-platform/terms), including the
[service-specific
terms](https://cloud.google.com/maps-platform/terms/maps-service-terms) for this
service. This section describes additional service usage requirements for
Grounding Lite, including compatible LLMs and source attribution requirements.

### Requirements for Compatible LLMs

**You may only use Grounding Lite with an LLM that is compliant with the Google
Maps Platform Terms of Service.**

For example, you are responsible for ensuring that Google Maps Content is not
cached by, stored by, or used to improve the LLM that you choose to use. Before
using Grounding Lite, you will need to review the Terms of Service for any model
you intend to use with Grounding Lite. You must not use Grounding Lite with any
models that use the data input into the model for any model training or
improvement. **You are responsible for ensuring that your use of the model fully
complies with the restrictions on Google Maps Content in the Google Maps
Platform Terms of Service, including the service specific terms.**

### Attribution requirements for Google Maps sources

Each tool response from Grounding Lite includes sources. When presenting results
that use tools provided by Grounding Lite, you must include the associated
Google Maps sources in a way that meets the following requirements:

- The Google Maps sources must immediately follow the generated content that the sources support. This generated content is also referred to as **Grounded Output**.
- The Google Maps sources must be viewable within one user interaction.

#### Sources for the Search places tool

The `search_places` tool `places` field provides sources that support the
`summary`. For `places`, the following metadata is returned:

- `place` (resource name)
- `id`
- `location`
- `googleMapsLinks`

For each place, you must generate a link preview that meets these requirements:

- Attribute each source to Google Maps, following the [Grounding Lite text
  attribution guidelines](https://developers.google.com/maps/ai/grounding-lite/attribution).
- Link to the source using the `places.googleMapsLinks.placeUrl` from the response.

## Configure LLMs to use the MCP server

To use Grounding Lite, you first need a Google Cloud project with the *Maps
Grounding Lite* API service enabled, as well as either an API key or OAuth
client ID. Then, you can configure LLMs to access the MCP server. Grounding Lite
MCP server uses Streamable HTTP transport.

### Enable the *Maps Grounding Lite* service on your Google Cloud project

To enable the API on your project:

1. In the [Google Cloud Console](https://console.developers.google.com/), choose the project you want to use for Grounding Lite.
2. Enable billing for the project in the [Google Cloud
   Console](https://console.developers.google.com/billing/enable).
3. Enable Grounding Lite in the [Google Cloud
   Console API Library](https://console.developers.google.com/apis/library/mapstools.googleapis.com).

> [!NOTE]
> **Note:** Maps Grounding Lite API does not charge during experimental, but billing must be enabled on the project.

### Authenticate using an API key

You can use an existing API key with Maps Grounding Lite or create a new one, as
long as you enable the [*Maps Grounding Lite* API
service](https://console.cloud.google.com/marketplace/product/google/mapstools.googleapis.com)
on both the Google Cloud project and the key.

To authenticate using an API key:

1. Create or configure an API key by following the steps in [Getting started
   with Google Maps Platform](https://developers.google.com/maps/get-started#api-key).
2. Pass the key to the MCP server using the `X-Goog-Api-Key` header. You need to specify this as a custom HTTP header in the LLM's MCP tool configuration.

> [!NOTE]
> **Note:** When creating or configuring an API key, be sure to limit the use of the key by applying the appropriate restrictions. For more information, see [Restrict your API
> keys](https://developers.google.com/maps/api-security-best-practices#restricting-api-keys).

### Authenticate using OAuth

You can authenticate using OAuth by creating OAuth credentials and passing them
to the MCP host or MCP server application.

To authenticate using OAuth:

1. In the [Google Cloud Console](https://console.developers.google.com/), choose the project you want to use for Grounding Lite.
2. In the *API \& Services* menu, select **Credentials**.
3. In the top menu, select **Create credentials \> OAuth client ID**.
4. If the project doesn't have a configured consent screen, click **Configure
   consent screen** and follow the on-screen instructions.
5. In the *Metrics* section, click **Create OAuth client**.
6. On the *Create OAuth client ID* screen, select an application type and enter a name for the client ID.
7. Specify the additional details that are relevant to your application type. For example, if you are creating a web application, add authorized URIs for browser and server requests.
8. Once your client is created, save the client ID and secret.
9. When configuring your MCP host or MCP server application to access Grounding Lite, pass your OAuth client ID and secret.

For more information, see [Using OAuth 2.0 to Access Google
APIs](https://developers.google.com/identity/protocols/oauth2).

### Configure LLMs to access the Grounding Lite MCP server

Once you have a Google Cloud project with the *Maps Grounding Lite API* service
enabled and valid credentials, such as an API key or OAuth client ID and secret,
you can configure LLMs to access the MCP server by following the corresponding
MCP configuration documentation and using the Grounding Lite MCP server URL:
**https://mapstools.googleapis.com/mcp**

For more information, see [Configure MCP in an AI
application](https://docs.cloud.google.com/mcp/configure-mcp-ai-application).

#### Configure Grounding Lite with the Gemini CLI

This section provides an example of how to configure the Grounding Lite MCP
server using the [Gemini CLI](https://github.com/google-gemini/gemini-cli). For
more details, see the [MCP servers with the Gemini
CLI](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md).

1. Once you install the Gemini CLI, you can use the add command to configure
   Maps Grounding Lite MCP server:

       gemini mcp add -s user -t http -H 'X-Goog-Api-Key: API_KEY' maps-grounding-lite-mcp https://mapstools.googleapis.com/mcp

   If the configuration was successful, you should see a confirmation that the
   server has been added to your user settings.
2. To validate that the server is working correctly, run the `/mcp list`
   command:

       > /mcp list

       Configured MCP servers:

       maps-grounding-lite-mcp - Ready (3 tools)
       Tools:
       -   compute_routes
       -   lookup_weather
       -   search_places

3. Start asking Maps related questions with the CLI. For example, try
   "Recommend me some restaurants in Mountain View" which should call the
   search_places tool on your behalf.

> [!NOTE]
> **Note:** For information on configuring a Gemini CLI extension to access Grounding Lite using OAuth, see the [Gemini
> CLI](https://docs.cloud.google.com/mcp/configure-mcp-ai-application#gemini-cli) section in the MCP on Google Cloud documentation

## Sharing feedback

To share feedback about Grounding Lite, use the following forms:

- [Report a bug](https://issuetracker.google.com/issues/new?component=1939139&template=2210898)
- [Submit a feature request](https://issuetracker.google.com/issues/new?component=1939139&template=2210768)
- [Provide feedback](https://docs.google.com/forms/d/e/1FAIpQLSe72eobSaaE2UGgvC7edpeRWRjD3AZvDDYrRQDbhyoNVGWcTw/viewform)