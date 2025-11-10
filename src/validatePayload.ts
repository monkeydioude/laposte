import { EventMap, NewUserMessageData, DeleteUserMessageData } from "./types.ts";
import { isValidEmail, ensureNonEmpty } from "./utils.ts"


export function validatePayload<Evt extends keyof EventMap>(event: Evt, payload: any): EventMap[Evt] {
  if (event === "new.user") {
    const p = payload as NewUserMessageData;
    // const p = payload as Record<string, string>;
  
    // CA VIENT DE LA CONFIGURATION
    // const fields = ["email", "firstname", "lastname"];
    // for (const field in fields) {
    //  p[field] = ensureNonEmpty(p[field], field).toLowerCase();
    // }
    p.firstname = ensureNonEmpty(p.firstname, "firstname");
    p.lastname = ensureNonEmpty(p.lastname, "lastname");
  
    if (!isValidEmail(p.email)) {
      throw new Error("Invalid email format");
    }
    return p as EventMap[Evt];
  }

  if (event === "delete.user") {
    const p = payload as DeleteUserMessageData;

    p.email = ensureNonEmpty(p.email, "email").toLowerCase();

    if (!isValidEmail(p.email)) {
      throw new Error("Invalid email format");
    }
    return p as EventMap[Evt];
  }

  throw new Error(`Unsupported event '${String(event)}'`);
}