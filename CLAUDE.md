# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repo contains two related projects:

1. **xuefeng-agent-master/** — A Python CLI AI college admission advisor (高考志愿顾问). Single-file architecture built on OpenAI-compatible LLM APIs.
2. **2026-06-10-xuefeng-miniprogram-plan.md** — Implementation plan for porting the agent to a WeChat mini-program (Uniapp + Vue3 + CloudBase).

## Commands

### Python Agent

```bash
# Install dependencies (no requirements.txt — install manually)
pip install openai pywin32

# Configure
cp .env.example .env
# Edit .env with your LLM_API_KEY

# Run interactively
python agent.py
```

The agent has no test suite, no linter config, and no build step. It's a single-file script.

### Mini-Program (not yet implemented)

The plan in `2026-06-10-xuefeng-miniprogram-plan.md` is for reference only — no code has been written for the mini-program yet.

## Architecture (xuefeng-agent-master)

**Core pipeline:** `User Input → Intent Detection → Slot Extraction → LLM Reasoning → Cleaned Output`

Key files and their roles:

- **[agent.py](xuefeng-agent-master/agent.py)** — Everything in one file. `GaokaoAdvisor` class orchestrates: slot management (`SLOTS` dict with 7 fields), intent detection (`is_consultation_intent`), slot extraction from free text (`extract_slots_from_message`), web search (`web_search` via Baidu scraping), LLM chat via OpenAI client, and format cleanup (`cleanup_format` strips Markdown). CLI loop handles `/paste`, `/slots`, `/reset`, `/quit` commands.

- **[system_prompt.md](xuefeng-agent-master/system_prompt.md)** — The agent's persona and behavioral rules (loaded as the system message). Defines: 5-slot information gathering workflow, persona as a blunt veteran advisor, rigid formatting bans (no Markdown, no emoji, no tables), and data honesty rules (no fabricated admission scores).

- **[knowledge_base.md](xuefeng-agent-master/knowledge_base.md)** — 850+ lines of structured domain knowledge injected into every system message. Covers: admission methodology (冲稳保), 12 discipline categories, city-industry mapping, stable career paths, vocational college strategy, and 2025-2026 trends.

- **[gaokao_data.py](xuefeng-agent-master/gaokao_data.py)** — Optional module for live admission data scraping. `query_admission(school, province, year)` searches Baidu and extracts structured data. Used as a higher-priority data source before falling back to generic `web_search()`.

- **[.env.example](xuefeng-agent-master/.env.example)** — LLM configuration via `LLM_PROVIDER` presets (deepseek/qwen/glm/moonshot/openai/ollama) or manual `LLM_BASE_URL` + `LLM_MODEL` + `LLM_API_KEY`.

**Slot system (7 fields):** province, score_rank, subject, interest, region, family, goal. Extracted from user messages via regex/keyword matching in `extract_slots_from_message()`. At least province + score_rank + goal must be filled before the agent gives recommendations.

**LLM provider pattern:** `PRESETS` dict maps provider name → `{base_url, model}`. `resolve_config()` checks `LLM_PROVIDER` env var against presets, falling back to manual `LLM_BASE_URL`/`LLM_MODEL`. All providers must speak OpenAI-compatible `/chat/completions` API.

**Search strategy:** Two-tier — first tries `gaokao_data.query_admission()` for school+province specific queries; if unavailable or no match, falls back to `web_search()` which scrapes Baidu results and extracts text from linked pages.

## Mini-Program Plan Notes

The plan (`2026-06-10-xuefeng-miniprogram-plan.md`) specifies a 4-phase build:

1. **Phase 1 (Foundation):** Uniapp scaffolding, CloudBase setup, WeChat login, LLM proxy cloud function, JS port of agent slot logic
2. **Phase 2 (MVP):** Chat UI with bubbles + slot progress bar, session persistence, report generation, school search, user profile, sharing
3. **Phase 3 (Payments):** Credits system (3 free/day), WeChat Pay integration, report unlocking UI, PDF generation
4. **Phase 4 (B2B Advisor Dashboard):** Advisor role/accounts, student profile workbench, conversation monitoring/takeover, annotation on reports

Key constraint: CloudBase cloud functions don't support SSE streaming. The plan suggests pseudo-streaming (chunked rendering with `setInterval`) as a workaround.

## When Working with the Mini-Program Plan

The plan references the `superpowers:executing-plans` skill. Implementation should follow the task ordering in the plan — Phase 1 tasks are sequential dependencies for later phases. The plan is a spec document, not a TODO list; each task's steps are implementation guidance, not exact file contents to write.
