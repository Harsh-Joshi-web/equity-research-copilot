# GenAI Equity Research Copilot

## Goal and scope
Build **one** portfolio-ready, locally runnable GenAI project with **React + Vite (frontend)** and **Python + FastAPI (backend)**. No .NET, paid hosting, or paid API is required. The project upgrades a basic PDF Q&A demo into a **financial research assistant** that compares annual reports from different companies and years, cites its evidence, and shows a few charts. Prioritize working features, interview-ready explanations, and a reproducible GitHub repo over styling.

**Definition of done for MVP:** Upload at least four annual reports (two companies, two years); ask questions over selected reports; retrieve source passages with company/year/page metadata; compare revenue and operating margins with clear units and fiscal periods; calculate growth using Python; show a comparison table/chart in React; handle missing evidence rather than inventing values; and run a small evaluation set.

## Stack and cost
- React + Vite + JavaScript (or TypeScript if preferred), Axios, Bootstrap (minimal), Recharts — free.
- Python 3.11+, FastAPI, Uvicorn, Pydantic — free.
- PyMuPDF for PDF text extraction; sentence-transformers `all-MiniLM-L6-v2` for **local** embeddings; FAISS CPU for **local** vector search — free.
- LangChain for ingestion/retrieval orchestration; Gemini via Google AI Studio **free tier**, subject to current availability, quotas and terms. No paid billing is required for this plan. **Never commit API keys.** If a free Gemini model is unavailable, use Ollama locally as an optional alternative (hardware permitting).
- Optional `yfinance` for market data **only in enhancement phase**: unofficial, sometimes delayed/incomplete; intended for personal research. No key needed.
- No auth, Supabase, Docker, cloud database, deployment, or multi-agent system in MVP.

Free resources: https://aistudio.google.com/ ; https://ai.google.dev/gemini-api/docs/pricing ; https://ai.google.dev/gemini-api/docs/api-key ; https://ollama.com/ ; https://www.sbert.net/ ; https://github.com/facebookresearch/faiss ; https://pymupdf.readthedocs.io/ ; https://fastapi.tiangolo.com/ ; https://vite.dev/ ; https://recharts.org/

## Proposed UX (minimal styling)
1. **Reports**: PDF upload, company and fiscal-year fields, indexed document list, delete/reindex.
2. **Research**: choose documents, ask a question, display response and clickable evidence cards (document name + page + short excerpt); show loading/errors.
3. **Compare**: select two companies and years, show structured metrics with units/periods, chart, narrative summary, and per-metric citations.

**Illustrative question:** “Compare TCS and Infosys revenue growth and operating margins in FY2024 and FY2025; cite the annual reports.” Any numbers in mockups are placeholders and must not be used as financial facts.

## Architecture
`React UI -> FastAPI REST -> PDF ingestion / retrieval / comparison services -> FAISS + local metadata -> Gemini LLM`

Ingestion: PDF -> page-aware extraction -> chunks with `document_id, company, fiscal_year, page_number, chunk_id` -> local embeddings -> FAISS index + metadata persistence.

Research: user question + selected document IDs -> metadata-filtered retrieval -> prompt with retrieved passages -> LLM response -> evidence IDs -> API response. **Only display citations that map to retrieved source chunks.**

Comparison: retrieve passages for each company/period -> extract structured financial values with source evidence -> validate fields, fiscal year, currency, unit, and accounting definitions -> compute growth/margins in Python where inputs suffice -> render table/chart. If data is missing or non-comparable, say so.

## Suggested repository layout
```
equity-research-copilot/
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx                  # routes/tabs
│       ├── components/
│       │   ├── ReportUpload.jsx     # PDF upload and metadata
│       │   ├── ReportList.jsx       # indexed documents
│       │   ├── ResearchChat.jsx     # question and evidence
│       │   └── CompanyCompare.jsx   # metrics, chart, citations
│       └── services/api.js         # Axios FastAPI client
├── backend/
│   ├── main.py                      # FastAPI app and CORS
│   ├── schemas.py                   # request/response models
│   ├── pdf_service.py               # extraction and metadata
│   ├── vector_service.py            # embeddings, FAISS, persistence
│   ├── research_service.py          # RAG + citations
│   ├── comparison_service.py        # extraction, validation, calculations
│   ├── requirements.txt
│   ├── .env.example                  # GEMINI_API_KEY=...
│   └── data/                         # local PDFs/index; gitignored
├── tests/                            # retrieval and calculation tests
├── .gitignore
└── README.md
```
This is a target structure; create files only as each task needs them.

## MVP task plan (roughly 12–18 focused hours, may vary)

### Session 1 — Bootstrap and API contract (1–2 h)
- [ ] Create Git repo; scaffold Vite React and Python virtual environment/FastAPI.
- [ ] Add `/health` endpoint, CORS for local frontend, Axios base URL from Vite env.
- [ ] Create three minimal tabs: Reports, Research, Compare.
- [ ] Verify React calls `/health` successfully.
**Concepts:** component state, HTTP, async/await, CORS, environment variables.

### Session 2 — PDF ingestion and indexing (2–3 h)
- [ ] Add PDF upload endpoint (`POST /reports`) with company/year metadata.
- [ ] Extract page-aware text using PyMuPDF; handle scanned/image-only PDFs with a clear unsupported/needs-OCR message.
- [ ] Chunk with overlap, attach source metadata, embed locally, persist FAISS and metadata.
- [ ] Add `GET /reports`; support deleting/reindexing later if time permits.
**Concepts:** document loaders, chunking, embeddings, vector stores, metadata.

### Session 3 — Evidence-backed RAG (2–3 h)
- [ ] Obtain Gemini API key from Google AI Studio; store in backend `.env`, never frontend or Git.
- [ ] Implement `POST /research` with question and selected report IDs.
- [ ] Retrieve relevant chunks; generate answer constrained to supplied context.
- [ ] Return evidence references `{document_id, filename, page_number, chunk_id, excerpt}`; display in React.
- [ ] Handle “not found in reports” and quota/network errors.
**Concepts:** RAG, retrieval, prompt engineering, hallucination controls, citations.

### Session 4 — Financial extraction and comparison (3–4 h)
- [ ] Define Pydantic response schema: company, fiscal period, metric, numeric value, currency/unit, evidence.
- [ ] Extract revenue and operating profit/margin for two companies and years, where supported.
- [ ] Normalize units (e.g., crore vs million), fiscal periods, and metric definitions; refuse unsupported comparisons.
- [ ] Calculate year-over-year growth in Python, not solely with LLM arithmetic.
- [ ] Add `POST /compare` and React comparison table plus Recharts bar/line chart.
**Concepts:** structured outputs, validation, deterministic computation, grounded reasoning.

### Session 5 — Evaluation and GitHub polish (2–4 h)
- [ ] Prepare 8–12 test questions with expected source reports/pages and known numeric answers.
- [ ] Measure whether expected evidence is retrieved in top-k, and manually review answer/citation correctness.
- [ ] Test missing data, incorrect company/year, mixed units, duplicate PDFs, API failures.
- [ ] Add setup guide, architecture diagram, screenshots, demo questions, and limitations.
- [ ] Record a short demo showing upload -> research -> comparison.
**Concepts:** RAG evaluation, reliability, reproducibility, interview communication.

## API contracts (initial proposal)
- `GET /health` -> `{ "status": "ok" }`
- `POST /reports` (multipart PDF + company + fiscal_year) -> document ID and indexing status
- `GET /reports` -> document metadata list
- `POST /research` `{ "question": "...", "document_ids": ["..."] }` -> `{ "answer": "...", "evidence": [...] }`
- `POST /compare` `{ "company_a": "...", "company_b": "...", "years": [2024,2025] }` -> `{ "metrics": [...], "summary": "...", "evidence": [...] }`
Adjust response schemas as implementation develops; keep frontend and backend synchronized.

## Free key setup and safety
1. Go to https://aistudio.google.com/ and sign in.
2. Create a Gemini API key for a project with free-tier access, if available in your region/account; check https://ai.google.dev/gemini-api/docs/pricing for current model availability and limits.
3. Put `GEMINI_API_KEY=your_key_here` in `backend/.env`; add `.env`, uploaded PDFs, and FAISS index to `.gitignore`.
4. Use a currently free-tier-eligible model configured through an environment variable; do not hardcode a model name that may become unavailable.
5. Add rate-limit handling and avoid uploading private/confidential documents to hosted models without permission. Free-tier provider data-use terms may differ from paid offerings; review them.
6. Optional offline route: install Ollama and a suitable local model; keep the LLM provider behind one service interface.

## Enhancement backlog — deliberately **NOT** required for MVP
**E1 — Tool calling (high resume value, ~2–4 h):** Define `search_reports()` and `calculate_metric()` tools, let the LLM request them, execute and log tool results. This is the first recommended upgrade.

**E2 — Live stock overview (~2–4 h):** Use yfinance for price history and available company metrics, show timestamps and data caveats; separate sourced market data from report-based facts.

**E3 — Hybrid retrieval (~3–5 h):** Combine BM25/keyword with FAISS semantic search; compare retrieval accuracy against baseline.

**E4 — LangGraph agent workflow (~4–6 h):** Add a small state graph (plan -> retrieve -> calculate -> verify -> answer); do not claim agentic architecture before implementing it.

**E5 — Persistent chat and saved research (~2–4 h):** SQLite conversation history and saved comparison reports.

**E6 — Research report export (~1–3 h):** Export Markdown/PDF with citations and explicit as-of dates.

**E7 — Financial news/sentiment (~3–5 h):** Add a lawful, free news source if available; distinguish sentiment from investment recommendations.

**E8 — Stronger evaluation (~3–5 h):** Add retrieval metrics, answer faithfulness checks, and a regression dataset.

Do not add these until the MVP works end-to-end.

## Interview preparation checklist
- Explain RAG vs fine-tuning; why FAISS and local embeddings.
- Explain chunk size/overlap and how document/page metadata enables citations.
- Explain top-k retrieval, metadata filters, and hallucination handling.
- Explain structured outputs and why financial calculations belong in Python.
- Explain retrieval/answer evaluation and examples of failures.
- Explain React-to-FastAPI data flow, state management, loading/error handling.
- If E1 is implemented: explain tool calling vs a fully autonomous agent.

## Resume entry (use **only after implemented**)
**GenAI Equity Research Copilot | React, FastAPI, LangChain, Gemini, FAISS, RAG**
Built a multi-document financial research assistant to compare company performance across annual reports using metadata-aware RAG, structured financial extraction, source-grounded answers, and React visualizations.

Add **tool calling / LangGraph / live market data** to this entry only if those enhancements are actually completed.

## Instructions for a fresh ChatGPT conversation
Upload this README and say:
> I am building the GenAI Equity Research Copilot described in this README. Start with Session 1 only. Give me exact commands, required files, complete minimal code, how to run and verify, and 3–5 interview questions. Keep React styling minimal. Do not implement later sessions yet; wait for my confirmation.

At the end of each session, ask ChatGPT to update the README checklist and summarize decisions, errors, and completed work so a future chat can continue without relying on conversation memory.
