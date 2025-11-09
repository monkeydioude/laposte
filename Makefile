.PHONY: dev
dev:
	npm install
	docker compose up -d --remove-orphans
	npm run dev

.PHONY: dexplorer
dexplorer:
	docker compose exec event_broker /app/explorer