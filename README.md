# LAPOSTE

Un worker pour envoyer des emails en fonction d'evenement.

## .env
- `BROKER_ADDR` — gRPC broker address.
- `SUBSCRIBE_EVENTS` — comma-separated list of events (default: `new.user`).
- `SERVICE_ID` — your `clientId` (default: `email-service`).
- `SERVICE_NAME` — human-readable service name (default: `email-service`).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — SMTP configuration parameters.
- `SMTP_FROM` — sender email address (required).
- `DRY_RUN` — if `true`, emails are not sent but only logged.
