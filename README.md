# LAPOSTE
## Email Service (config-driven, i18n, history)

An event-driven email sending worker.  
Un worker pour envoyer des emails en fonction d'evenement.  

Listen to events through a gRPC event broken and send emails accordingly.

## .env
- `BROKER_ADDR` — gRPC broker address.
- `SERVICE_ID` — your `clientId` (default: `email-service`).
- `SERVICE_NAME` — human-readable service name (default: `email-service`).
- `CONFIG_PATHS` - Comma-separated YAML config files, one per product, each defining its events and templates (default: `./config.yml`). `CONFIG_PATH` (single file) still works.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — SMTP configuration parameters.
- `SMTP_FROM` — default sender email address (required). A config file can set its own with a top-level `from:`.
- `DRY_RUN` — if `true`, emails are not sent but only logged.
- `HTTP_PORT` - Port for the HTTP API server (default: `8080`).
- `LANG_DEFAULT` - Default language used for templates.

## Several products
One instance serves several products, each with its own config file:
```sh
CONFIG_PATHS=/srv/sb_back/config.yml,/srv/kabane/laposte/config.yml
```
- Templates are found next to the config file declaring the event (`templates.path` is relative to it).
- `from: "Kabane <hello@kabane.io>"` at the top of a config sets the sender of its events; the SMTP account must be allowed to send as it.
- Heyo routes by event name only: an event name must be declared in one config file only (boot fails otherwise). Prefix a product's events, e.g. `kabane.welcome`.

## With the broker explorer (make dexplorer), send a message to your broker (event: `new.user`) with JSON payload:
```json
@new.user {"email":"email@email.com","firstname":"Syuzi","lastname":"Dourish"}
```
## Deduplication (Optional)
- **If `dedup_id` is provided**: The service guarantees the email is sent only once per `(dedup_id, email)` pair. If an SMTP error occurs, the lock is released, allowing subsequent retries to succeed.
```json
@new.user {"email":"email@email.com","dedup_id":"new-user-9a82f3","firstname":"Syuzi","lastname":"Dourish"}
```
## With the broker explorer (make dexplorer), send a message to your broker (event: `delete.user`) with JSON payload:
```json
@delete.user {"email":"email@email.com","firstname":"Syuzi","lastname":"Dourish","reason":"user request"}
```
```json
@collaborator.invite {"email":"email@gmail.com","message":"Please join the team!","invite_link":"https://acme.com/invite/123","role_viewer": "true"}
```
```json
@reset.password {"email":"email@email.com","dedup_id":"reset-password-9a82f3","firstname":"Syuzi","lastname":"Dourish"}
```

## Notes
- When `DRY_RUN=true`, emails are not sent — they’re logged to console.
- Set `DRY_RUN=false` to actually send.

- Subscribes to events from `config.yml` (no hardcoded EventMap).
- i18n templates (fr/en) per event.
- History persisted in PostgreSQL and exposed via HTTP:
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

> This project was developed by The calq Studio Team ([N0fish](https://github.com/N0fish), [monkeydioude](https://github.com/monkeydioude)) for the Spendbaker project, in November 2025.