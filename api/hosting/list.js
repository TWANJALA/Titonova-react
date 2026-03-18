import { config, proxyToGateway, shouldProxyToGateway } from "../_gatewayProxy.js";
import { handleDirectHostingAction } from "../_hostingDirect.js";

export { config };

export default async function handler(req, res) {
  if (shouldProxyToGateway(req, "/api/hosting/list")) {
    return proxyToGateway(req, res, "/api/hosting/list");
  }
  return handleDirectHostingAction(req, res, "list");
}
