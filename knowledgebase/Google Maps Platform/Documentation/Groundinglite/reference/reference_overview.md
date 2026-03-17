# MCP Reference: mapstools.googleapis.com

A [Model Context Protocol (MCP) server](https://modelcontextprotocol.io/docs/learn/server-concepts) acts as a proxy between an external service that provides context, data, or capabilities to a Large Language Model (LLM) or AI application. MCP servers connect AI applications to external systems such as databases and web services, translating their responses into a format that the AI application can understand.

This is an MCP server provided by the Maps Grounding Lite API. The server provides tools for developers to build LLM applications on top of Google Maps Platform.

### Server Endpoints

An MCP service endpoint is the network address and communication interface (usually a URL) of the MCP server that an AI application (the Host for the MCP client) uses to establish a secure, standardized connection. It is the point of contact for the LLM to request context, call a tool, or access a resource. Google MCP endpoints can be global or regional.

The mapstools.googleapis.com MCP server has the following MCP endpoint:

- <https://mapstools.googleapis.com/mcp>

### MCP Tools

An [MCP tool](https://modelcontextprotocol.io/legacy/concepts/tools) is a function or executable capability that an MCP server exposes to a LLM or AI application to perform an action in the real world.

To view the tools' details for the mapstools.googleapis.com MCP server, see the reference documentation for each tool:

- [`search_places`](https://developers.google.com/maps/ai/grounding-lite/reference/mcp/search_places)
- [`lookup_weather`](https://developers.google.com/maps/ai/grounding-lite/reference/mcp/lookup_weather)
- [`compute_routes`](https://developers.google.com/maps/ai/grounding-lite/reference/mcp/compute_routes)