# LAPOSTE
## Email Service (config-driven, i18n, history)

An event-driven email sending worker.
Un worker pour envoyer des emails en fonction d'evenement.  

gRPC subscriber that sends a welcome email when it receives the `new.user` event.

## .env
- `BROKER_ADDR` — gRPC broker address.
- `SERVICE_ID` — your `clientId` (default: `email-service`).
- `SERVICE_NAME` — human-readable service name (default: `email-service`).
- `CONFIG_PATH` - Path to the YAML configuration file defining events and templates (default: `./config.yml`).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — SMTP configuration parameters.
- `SMTP_FROM` — sender email address (required).
- `DRY_RUN` — if `true`, emails are not sent but only logged.
- `HTTP_PORT` - Port for the HTTP API server (default: `8080`).
- `HISTORY_DB_PATH` - Path to the SQLite history database file (default: `./var/history.sqlite`).
- `LANG_DEFAULT` - Default language used for templates.

## Send a message to your broker (event: `new.user`) with JSON payload:
```json
@new.user {"email":"email@email.com","firstname":"Syuzi","lastname":"Dourish"}
```
## Send a message to your broker (event: `delete.user`) with JSON payload:
```json
@delete.user {"email":"email@email.com","firstname":"Syuzi","lastname":"Dourish","reason":"user request"}
```

## Notes
- When `DRY_RUN=true`, emails are not sent — they’re logged to console.
- Set `DRY_RUN=false` to actually send.

- Subscribes to events from `config.yml` (no hardcoded EventMap).
- i18n templates (fr/en) per event.
- History persisted in SQLite (`HISTORY_DB_PATH`) and exposed via HTTP:
  - `GET /health`
  - `GET /history?limit=50&email=jane@acme.io&event=new.user`

| URL                                                  | Description                                                |
|:----------------------------------------------------:|:----------------------------------------------------------:|
| http://localhost:8080/health                         | Check if the server is running → responds with {"ok":true} |
| http://localhost:8080/history                        | List of the most recent emails (50 by default)             |
| http://localhost:8080/history?limit=10               | Limit the result to 10 entries                             |
| http://localhost:8080/history?event=new.user         | Filter by event type                                       |
| http://localhost:8080/history?email=test@example.com | Filter by recipient email                                  |
| http://localhost:8080/events                         | Returns the list of supported events                       |

- Payload may include `lang` (e.g., `fr`), otherwise `LANG_DEFAULT` is used.