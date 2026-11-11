# FiverrOS — mobile-first public demo + MCP tools

This is a single Next.js app. It runs as a mobile-friendly website and exposes a stateless MCP endpoint at `/mcp` for compatible AI clients.

## Included
- Profile analysis and profile draft builder
- Gig draft builder
- Competitor observation analysis (user-supplied evidence only)
- Pricing estimate from user-supplied inputs
- Portfolio case-study organizer
- Client reply drafts
- Performance and Away Mode preview controls
- Streamable HTTP MCP endpoint: `POST /mcp`; tool list: `tools/list`

## Deploy
Deploy the project root as a Next.js project on Vercel. No backend URL is needed; the website and API are served by the same deployment.

## Important limitations
- **ChatGPT Android does not currently support custom MCP server connections.** Custom MCP connections are web-only and require an eligible ChatGPT plan/workspace. This is a platform limitation, not something this project can bypass.
- MCP tools are stateless and draft-only. They do not log into Fiverr, read a private inbox, edit a profile, publish gigs, or send messages.
- This public demo does not store user data, performance history, approvals, or Away Mode settings. Do not enter passwords, session cookies, payment details, or other secrets.
- It is not a production multi-user SaaS. Add OAuth authentication, a database with per-user isolation, audit logging and rate limiting before enabling private workspaces or persistent data.
- Market analysis uses only observations supplied by the user; it does not claim live Fiverr demand, search volume or sales data.
- Price estimates are based on inputs, not verified market averages.

## Local development
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.
