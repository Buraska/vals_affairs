import { isValidEmail } from "@/utilities/utility"
import { MAIL_ENDPOINT_SUBSCRIBE, MAIL_ENDPOINT_SUBSCRIBE_ARGS } from "@/app/api/endpoints"



export class MailServce{

    static async subscribeUser(email: string, name: string): Promise<Response>{
        const errors: string[] = []
        if (!isValidEmail(email)) {
          errors.push("Invalid email")
        }
        if (!name){
          errors.push("Invalid name")
        }
        if (errors.length !== 0){
          return Response.json({ error: errors.join(', ') }, { status: 400 })
        }
        const body = {
          ...MAIL_ENDPOINT_SUBSCRIBE_ARGS,
          email,
          name,
        }
      
        const res = await fetch(MAIL_ENDPOINT_SUBSCRIBE, {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(body),
        })
      
        if (!res.ok) console.log(`Cannot subscribe user: ERROR ${res.status} | ${await res.text()}`)
      
        return res;
      }
}