import { Zoho, ZohoApiClient } from "@trieb.work/zoho-ts";

export const invoiceService = new Zoho(
    await ZohoApiClient.fromOAuth({
      orgId: "20113799416",
      dc: ".eu",
      apiFlavour: "invoice",
      scope: "ZohoInvoice.fullaccess.all",
      client: {
        id: process.env.ZOHO_CLIENT_ID ?? "",
        secret: process.env.ZOHO_CLIENT_SECRET ?? "",
      },
    }),
  );