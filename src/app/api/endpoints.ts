import { email } from "payload/shared"

export const MAIL_ENDPOINT_BASE = "https://mail.thenextchance.eu/"
export const MAIL_ENDPOINT_SUBSCRIBE = "https://mail.thenextchance.eu/api/public/subscription"
export const MAIL_ENDPOINT_SUBSCRIBE_ARGS = {email: null, name: null, list_uuids: ["f5519d0e-4c5f-4533-81d9-2798d130654b"]} as const
