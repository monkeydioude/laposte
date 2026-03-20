.PHONY: dev
dev: install-git-hook
	npm install
	docker compose up -d --remove-orphans
	npm run dev

.PHONY: install-git-hook
install-git-hook:
	@echo "🔧 Installing git pre-commit hook..."
	@mkdir -p .git/hooks
	@cp scripts/git-hooks/pre-commit .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "✅ Git pre-commit hook installed."

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
	rm -rf dist
	npm i
	npm run build

.PHONY: prod
prod:
	node dist/main.js

.PHONY: dpush
dpush:
	docker login
	docker buildx build --platform linux/amd64,linux/arm64 -t drannoc/laposte:latest --push .

.PHONY: test
test: install-git-hook
	./scripts/tests.sh

.PHONY: gitleaks
gitleaks: install-git-hook
	./scripts/gitleaks.sh

.PHONY: test test-up test-down
test-up:
	docker compose up -d db_test
	@echo "waiting for db_test..."
	@until docker compose exec -T db_test pg_isready -U test -d test > /dev/null 2>&1; do sleep 1; done

test:
	$(MAKE) test-up
	PGHOST=localhost PGPORT=55432 PGUSER=test PGPASSWORD=test PGDATABASE=test npm run test

test-down:
	docker compose down -v
