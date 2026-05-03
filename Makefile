SHELL := /bin/bash

BACKEND_DIR := backend
FRONTEND_DIR := frontend
VENV_DIR := $(BACKEND_DIR)/.venv
BACKEND_HOST := 127.0.0.1
BACKEND_PORT := 8000
FRONTEND_HOST := 127.0.0.1
FRONTEND_PORT := 5173

.PHONY: setup backend frontend

setup:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Creating backend virtualenv..."; \
		python3 -m venv "$(VENV_DIR)"; \
	fi
	@echo "Installing backend dependencies..."
	@. "$(VENV_DIR)/bin/activate" && python -m pip install -r "$(BACKEND_DIR)/requirements.txt"
	@echo "Installing frontend dependencies..."
	@cd "$(FRONTEND_DIR)" && npm install

backend:
	@cd "$(BACKEND_DIR)" && . ".venv/bin/activate" && python -m uvicorn app.main:app --host "$(BACKEND_HOST)" --port "$(BACKEND_PORT)" --reload

frontend:
	@cd "$(FRONTEND_DIR)" && npm run dev -- --host "$(FRONTEND_HOST)" --port "$(FRONTEND_PORT)"
