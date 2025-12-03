#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// @ts-ignore - authorizenet doesn't have types
import * as AuthorizeNet from "authorizenet";

// ESM interop: APIContracts at top level, APIControllers/Constants on default
const ApiContracts = AuthorizeNet.APIContracts;
const ApiControllers = (AuthorizeNet as any).default.APIControllers;
const SDKConstants = (AuthorizeNet as any).default.Constants;

// Environment configuration
const API_LOGIN_ID = process.env.AUTHNET_API_LOGIN_ID;
const TRANSACTION_KEY = process.env.AUTHNET_TRANSACTION_KEY;
const ENVIRONMENT = process.env.AUTHNET_ENVIRONMENT || "sandbox";

if (!API_LOGIN_ID || !TRANSACTION_KEY) {
  console.error("Error: AUTHNET_API_LOGIN_ID and AUTHNET_TRANSACTION_KEY environment variables are required");
  process.exit(1);
}

// Helper to create merchant auth
function getMerchantAuth() {
  const merchantAuth = new ApiContracts.MerchantAuthenticationType();
  merchantAuth.setName(API_LOGIN_ID);
  merchantAuth.setTransactionKey(TRANSACTION_KEY);
  return merchantAuth;
}

// Helper to execute controller with promise
function executeController(ctrl: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (ENVIRONMENT === "production") {
      ctrl.setEnvironment(SDKConstants.endpoint.production);
    }
    ctrl.execute(() => {
      const response = ctrl.getResponse();
      if (response === null) {
        reject(new Error(ctrl.getErrorResponse() || "No response from API"));
      } else {
        resolve(response);
      }
    });
  });
}

// Tool implementations
async function getSettledBatchList(firstSettlementDate?: string, lastSettlementDate?: string) {
  const request = new ApiContracts.GetSettledBatchListRequest();
  request.setMerchantAuthentication(getMerchantAuth());
  request.setIncludeStatistics(true);

  if (firstSettlementDate) {
    request.setFirstSettlementDate(new Date(firstSettlementDate));
  }
  if (lastSettlementDate) {
    request.setLastSettlementDate(new Date(lastSettlementDate));
  }

  const ctrl = new ApiControllers.GetSettledBatchListController(request.getJSON());
  const response = await executeController(ctrl);

  const apiResponse = new ApiContracts.GetSettledBatchListResponse(response);
  if (apiResponse.getMessages().getResultCode() !== ApiContracts.MessageTypeEnum.OK) {
    const errors = apiResponse.getMessages().getMessage();
    throw new Error(`API Error: ${errors[0].getCode()} - ${errors[0].getText()}`);
  }

  return apiResponse.getBatchList() || [];
}

async function getTransactionList(batchId: string) {
  const request = new ApiContracts.GetTransactionListRequest();
  request.setMerchantAuthentication(getMerchantAuth());
  request.setBatchId(batchId);

  const ctrl = new ApiControllers.GetTransactionListController(request.getJSON());
  const response = await executeController(ctrl);

  const apiResponse = new ApiContracts.GetTransactionListResponse(response);
  if (apiResponse.getMessages().getResultCode() !== ApiContracts.MessageTypeEnum.OK) {
    const errors = apiResponse.getMessages().getMessage();
    throw new Error(`API Error: ${errors[0].getCode()} - ${errors[0].getText()}`);
  }

  return apiResponse.getTransactions() || [];
}

async function getUnsettledTransactionList() {
  const request = new ApiContracts.GetUnsettledTransactionListRequest();
  request.setMerchantAuthentication(getMerchantAuth());

  const ctrl = new ApiControllers.GetUnsettledTransactionListController(request.getJSON());
  const response = await executeController(ctrl);

  const apiResponse = new ApiContracts.GetUnsettledTransactionListResponse(response);
  if (apiResponse.getMessages().getResultCode() !== ApiContracts.MessageTypeEnum.OK) {
    const errors = apiResponse.getMessages().getMessage();
    throw new Error(`API Error: ${errors[0].getCode()} - ${errors[0].getText()}`);
  }

  return apiResponse.getTransactions() || [];
}

async function getCustomerProfileTransactionList(customerProfileId: string) {
  const request = new ApiContracts.GetTransactionListForCustomerRequest();
  request.setMerchantAuthentication(getMerchantAuth());
  request.setCustomerProfileId(customerProfileId);

  const ctrl = new ApiControllers.GetTransactionListForCustomerController(request.getJSON());
  const response = await executeController(ctrl);

  const apiResponse = new ApiContracts.GetTransactionListResponse(response);
  if (apiResponse.getMessages().getResultCode() !== ApiContracts.MessageTypeEnum.OK) {
    const errors = apiResponse.getMessages().getMessage();
    throw new Error(`API Error: ${errors[0].getCode()} - ${errors[0].getText()}`);
  }

  return apiResponse.getTransactions() || [];
}

async function getTransactionDetails(transactionId: string) {
  const request = new ApiContracts.GetTransactionDetailsRequest();
  request.setMerchantAuthentication(getMerchantAuth());
  request.setTransId(transactionId);

  const ctrl = new ApiControllers.GetTransactionDetailsController(request.getJSON());
  const response = await executeController(ctrl);

  const apiResponse = new ApiContracts.GetTransactionDetailsResponse(response);
  if (apiResponse.getMessages().getResultCode() !== ApiContracts.MessageTypeEnum.OK) {
    const errors = apiResponse.getMessages().getMessage();
    throw new Error(`API Error: ${errors[0].getCode()} - ${errors[0].getText()}`);
  }

  return apiResponse.getTransaction();
}

async function getBatchStatistics(batchId: string) {
  const request = new ApiContracts.GetBatchStatisticsRequest();
  request.setMerchantAuthentication(getMerchantAuth());
  request.setBatchId(batchId);

  const ctrl = new ApiControllers.GetBatchStatisticsController(request.getJSON());
  const response = await executeController(ctrl);

  const apiResponse = new ApiContracts.GetBatchStatisticsResponse(response);
  if (apiResponse.getMessages().getResultCode() !== ApiContracts.MessageTypeEnum.OK) {
    const errors = apiResponse.getMessages().getMessage();
    throw new Error(`API Error: ${errors[0].getCode()} - ${errors[0].getText()}`);
  }

  return apiResponse.getBatch();
}

async function getMerchantDetails() {
  const request = new ApiContracts.GetMerchantDetailsRequest();
  request.setMerchantAuthentication(getMerchantAuth());

  const ctrl = new ApiControllers.GetMerchantDetailsController(request.getJSON());
  const response = await executeController(ctrl);

  const apiResponse = new ApiContracts.GetMerchantDetailsResponse(response);
  if (apiResponse.getMessages().getResultCode() !== ApiContracts.MessageTypeEnum.OK) {
    const errors = apiResponse.getMessages().getMessage();
    throw new Error(`API Error: ${errors[0].getCode()} - ${errors[0].getText()}`);
  }

  return {
    merchantName: apiResponse.getMerchantName(),
    gatewayId: apiResponse.getGatewayId(),
    processors: apiResponse.getProcessors(),
    contactDetails: apiResponse.getContactDetails(),
  };
}

// MCP Server setup
const server = new Server(
  {
    name: "authnet-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_settled_batch_list",
        description: "Get a list of settled batches within a date range. Returns batch IDs, settlement dates, and statistics.",
        inputSchema: {
          type: "object",
          properties: {
            firstSettlementDate: {
              type: "string",
              description: "Start date for the batch list (ISO 8601 format, e.g., 2024-01-01). Defaults to 30 days ago.",
            },
            lastSettlementDate: {
              type: "string",
              description: "End date for the batch list (ISO 8601 format). Defaults to today.",
            },
          },
        },
      },
      {
        name: "get_transaction_list",
        description: "Get all transactions within a specific settled batch.",
        inputSchema: {
          type: "object",
          properties: {
            batchId: {
              type: "string",
              description: "The batch ID to retrieve transactions for.",
            },
          },
          required: ["batchId"],
        },
      },
      {
        name: "get_unsettled_transaction_list",
        description: "Get all transactions that are pending settlement (not yet batched).",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_customer_profile_transaction_list",
        description: "Get all transactions for a specific customer profile ID.",
        inputSchema: {
          type: "object",
          properties: {
            customerProfileId: {
              type: "string",
              description: "The customer profile ID to retrieve transactions for.",
            },
          },
          required: ["customerProfileId"],
        },
      },
      {
        name: "get_transaction_details",
        description: "Get full details for a specific transaction by its transaction ID.",
        inputSchema: {
          type: "object",
          properties: {
            transactionId: {
              type: "string",
              description: "The transaction ID to retrieve details for.",
            },
          },
          required: ["transactionId"],
        },
      },
      {
        name: "get_batch_statistics",
        description: "Get aggregate statistics for a specific batch (totals, counts by card type, etc.).",
        inputSchema: {
          type: "object",
          properties: {
            batchId: {
              type: "string",
              description: "The batch ID to retrieve statistics for.",
            },
          },
          required: ["batchId"],
        },
      },
      {
        name: "get_merchant_details",
        description: "Get merchant account information including name, gateway ID, and processors.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      case "get_settled_batch_list":
        result = await getSettledBatchList(
          args?.firstSettlementDate as string | undefined,
          args?.lastSettlementDate as string | undefined
        );
        break;

      case "get_transaction_list":
        result = await getTransactionList(args?.batchId as string);
        break;

      case "get_unsettled_transaction_list":
        result = await getUnsettledTransactionList();
        break;

      case "get_customer_profile_transaction_list":
        result = await getCustomerProfileTransactionList(args?.customerProfileId as string);
        break;

      case "get_transaction_details":
        result = await getTransactionDetails(args?.transactionId as string);
        break;

      case "get_batch_statistics":
        result = await getBatchStatistics(args?.batchId as string);
        break;

      case "get_merchant_details":
        result = await getMerchantDetails();
        break;

      default:
        return {
          isError: true,
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
        };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Authnet MCP server running (${ENVIRONMENT} mode)`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
