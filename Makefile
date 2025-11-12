.PHONY: dev
dev:
	npm install
	docker compose up -d --remove-orphans
	npm run dev

.PHONY: dexplorer
dexplorer:
	docker compose exec event_broker /app/explorer

.PHONY: dbash
dbash:
	docker compose exec event_broker bash

.PHONY: dpsql
dpsql:
	docker compose exec db psql "postgres://dev:dev@127.0.0.1:5432/email_history?options=-c%20search_path%3Demail_history"

.PHONY: build
build:
	npm run build