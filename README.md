# LAPOSTE
## new-user-email-service

Un worker pour envoyer des emails en fonction d'evenement.  

gRPC subscriber that sends a welcome email when it receives the `new.user` event.

## .env
- `BROKER_ADDR` — gRPC broker address.
- `SUBSCRIBE_EVENTS` — comma-separated list of events (default: `new.user`).
- `SERVICE_ID` — your `clientId` (default: `email-service`).
- `SERVICE_NAME` — human-readable service name (default: `email-service`).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — SMTP configuration parameters.
- `SMTP_FROM` — sender email address (required).
- `DRY_RUN` — if `true`, emails are not sent but only logged.

## Send a message to your broker (event: `new.user`) with JSON payload:
```json
@new.user {"email":"allagultseva@gmail.com","firstname":"Syuzi","lastname":"Dourish"}
```

## Notes
- When `DRY_RUN=true`, emails are not sent — they’re logged to console.
- Set `DRY_RUN=false` to actually send.

