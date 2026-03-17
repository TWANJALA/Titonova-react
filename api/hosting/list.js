import { config, proxyToGateway } from "../_gatewayProxy.js";

export { config };

export default async function handler(req, res) {
  return proxyToGateway(req, res, "/api/hosting/list");
}
