export interface MessageData  {
  email: string;
  firstname: string;
  lastname: string
}

export interface MailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
