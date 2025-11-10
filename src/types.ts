export interface MessageData  {
  email: string;
  firstname: string;
  lastname: string
  reason?: string;
}

// TODO: Тут этого не надо, вообще ничего не надо кроме прочтения файла конфигурации
export interface NewUserMessageData extends MessageData {
  firstname: string;
  lastname: string;
}

export interface DeleteUserMessageData extends MessageData {
  firstname: string;
  lastname: string;
  reason?: string;
}

export interface EventMap {
  "new.user": NewUserMessageData;
  "delete.user": DeleteUserMessageData;
}

export interface BuiltEmail {
  subject: string;
  text?: string;
  html?: string;
}

/** Payload of the email to send */
export interface MailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
