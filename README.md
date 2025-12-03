# authnet-mcp

MCP server for Authorize.net transaction reporting and settlement data.

## Overview

**What is authnet-mcp?**

authnet-mcp is a Model Context Protocol (MCP) server that provides read-only access to Authorize.net transaction reporting APIs. Query settled batches, transaction details, and settlement statistics directly from AI assistants.

**How to use authnet-mcp?**

Install via npx, set your Authorize.net API credentials as environment variables, and connect from any MCP-compatible client (Claude Code, Cline, etc.).

**Key features:**

- View settled and pending batches
- Query transaction details by batch or transaction ID
- Get customer transaction history
- Retrieve batch statistics and merchant details
- **Read-only** - no payment processing, no risk of accidental charges
- **Secure** - all API calls over HTTPS, credentials never exposed

**Use cases:**

- Quick transaction lookups from your terminal
- Daily settlement reconciliation
- Customer payment history queries
- Batch reporting and statistics

## Requirements

- Node.js 18+

## Installation

```bash
npx authnet-mcp
```

Or install globally:

```bash
npm install -g authnet-mcp
```

## Configuration

Set these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHNET_API_LOGIN_ID` | Yes | Your Authorize.net API Login ID |
| `AUTHNET_TRANSACTION_KEY` | Yes | Your Authorize.net Transaction Key |
| `AUTHNET_ENVIRONMENT` | No | `sandbox` (default) or `production` |

### Claude Code Setup

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "authnet": {
      "command": "npx",
      "args": ["authnet-mcp"],
      "env": {
        "AUTHNET_API_LOGIN_ID": "your-login-id",
        "AUTHNET_TRANSACTION_KEY": "your-transaction-key",
        "AUTHNET_ENVIRONMENT": "production"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_settled_batch_list` | List settled batches within a date range |
| `get_transaction_list` | Get all transactions in a batch |
| `get_unsettled_transaction_list` | Get pending transactions |
| `get_transaction_details` | Full details for a specific transaction |
| `get_customer_profile_transaction_list` | All transactions for a customer profile |
| `get_batch_statistics` | Aggregate stats for a batch |
| `get_merchant_details` | Merchant account information |

## Example Queries

Once connected, ask your AI assistant:

- "Show me recent settled batches"
- "Get transactions for batch 1042572961"
- "What's pending settlement?"
- "Pull details on transaction 121364862857"

## Security

- **HTTPS only** - The Authorize.net SDK enforces TLS for all API calls
- **Read-only** - No payment processing capabilities, only reporting
- **Masked data** - Card numbers are returned masked (e.g., XXXX1234)
- **Local credentials** - API keys stay in your environment, never transmitted via MCP

## FAQ

**Is sandbox mode available?**
Yes, set `AUTHNET_ENVIRONMENT=sandbox` (this is the default).

**Can this process payments?**
No. This MCP is read-only for reporting. Use the official Authorize.net SDK for payment processing.

**What Node.js version is required?**
Node.js 18 or higher.

## License

MIT
