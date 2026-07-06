# Nexus – AI Project Planner

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21-red?style=for-the-badge&logo=angular">
  <img src="https://img.shields.io/badge/NestJS-Backend-e0234e?style=for-the-badge&logo=nestjs">
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb">
  <img src="https://img.shields.io/badge/Google-Gemini-blue?style=for-the-badge&logo=google">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript">
  <img src="https://img.shields.io/badge/Nx-Monorepo-143055?style=for-the-badge&logo=nx">
</p>

<p align="center">
AI-powered software project planning platform that transforms natural language ideas into structured engineering artifacts.
</p>

---

# Overview

Nexus is an AI-powered software project planning platform designed to automate the early stages of software development.

Instead of manually creating architecture diagrams, API documentation, database schemas, development timelines, and task breakdowns, Nexus generates them intelligently from a single natural language prompt using Google's Gemini AI.

The platform follows a modular generation pipeline where each engineering artifact is independently generated, streamed to the client in real time, persisted in MongoDB, and can later be updated without regenerating the complete project.

---

# Key Highlights

- AI-powered software planning
- Modular AI generation pipeline
- Real-time artifact streaming using Server-Sent Events (SSE)
- Live collaboration using WebSockets
- Incremental AI editing of individual project nodes
- MongoDB persistence with Mongoose
- Gemini API integration with automatic key rotation
- Concurrency-controlled generation pipeline
- Version-aware project artifacts
- Nx Monorepo architecture
- Angular + NestJS full-stack application
- Scalable service-oriented backend architecture

---

# Features

## AI Project Generation

Generate complete software planning artifacts from a single prompt.

Example:

> Build an online food delivery application similar to Swiggy.

Nexus automatically generates:

- Database Schema
- REST API Documentation
- Folder Structure
- Development Timeline
- Task Breakdown
- Team Assignment

---

## Intelligent Modular Generation

Each engineering domain is generated independently.

Instead of producing one massive AI response, Nexus creates modular artifacts that can evolve separately.

This architecture improves:

- Maintainability
- AI response quality
- Future extensibility

---

## Real-Time Streaming

Generated artifacts are streamed immediately to the frontend using Server-Sent Events.

Users can begin viewing results while the remaining artifacts are still being generated.

---

## AI Node Editing

Modify any individual project artifact through natural language.

Example:

> Replace MongoDB with PostgreSQL

Only the affected node is regenerated.

The complete project is never rebuilt unnecessarily.

---

## Live Collaboration

WebSockets synchronize project updates across connected clients.

Multiple users can collaborate while keeping project data synchronized in real time.

---

## Version Tracking

Every generated artifact maintains:

- Node ID
- Version
- Parent Version

This lays the foundation for rollback support, history tracking, and intelligent change management.

---

## Persistent Storage

Projects and generated artifacts are stored in MongoDB immediately after generation.

Nothing exists only in memory.

---

## Rate Limit Handling

Nexus includes a resilient AI request pipeline featuring:

- Gemini API key rotation
- Automatic retry logic
- Controlled concurrency
- Rate limit handling

This allows reliable generation even under free-tier API limitations.

---

# Architecture

```
                 User Prompt
                      │
                      ▼
             Prompt Parser Service
                      │
                      ▼
            Project Assembler Service
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
   AI Generation Pipeline      MongoDB Storage
        │
        ▼
     Google Gemini
        │
        ▼
 Generated Engineering Artifacts
        │
        ▼
 Server Sent Events (SSE)
        │
        ▼
 Angular Frontend
```

---

# Tech Stack

## Frontend

- Angular
- TypeScript
- CSS
- Standalone Components

## Backend

- NestJS
- Express
- REST APIs
- WebSockets
- Server-Sent Events (SSE)

## Database

- MongoDB
- Mongoose

## AI

- Google Gemini
- Structured JSON prompting
- Multi-key API rotation

## Monorepo

- Nx Workspace

---

# Project Structure

```
apps/
│
├── nexus-api
│   ├── controllers
│   ├── dto
│   ├── gateway
│   ├── schemas
│   ├── services
│   └── ai-provider
│
├── nexus-web
│   ├── dashboard
│   ├── workspace
│   ├── architecture-graph
│   ├── gantt
│   ├── collaboration
│   └── services
│
libs/
└── shared-types
```

---

# How It Works

1. User enters a project idea.
2. Prompt Parser determines the required engineering domains.
3. AI generation begins.
4. Artifacts are streamed progressively using SSE.
5. Each artifact is stored in MongoDB.
6. Users can edit any artifact individually.
7. Updates are synchronized using WebSockets.

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/shivam31704/Nexus---AI-Project-Planner.git

cd Nexus---AI-Project-Planner
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file inside the backend.

```
MONGODB_URI=

GEMINI_API_KEY=

GEMINI_API_KEYS=

GEMINI_MODEL=gemini-2.0-flash
```

---

## Start Backend

```bash
nx serve nexus-api
```

---

## Start Frontend

```bash
nx serve nexus-web
```

---

# Future Enhancements

- Authentication & Authorization
- Project Export (PDF / Markdown)
- GitHub Integration
- Jira Integration
- Docker Deployment
- CI/CD Pipeline
- Project Templates
- AI Chat Assistant
- Multi-project Workspace
- Architecture Visualization
- Version Rollback
- Team Management

---

# Why Nexus?

Modern software projects require significantly more than writing code.

Planning architecture, defining APIs, designing databases, organizing timelines, and coordinating development are equally important.

Nexus accelerates this process by combining modern AI capabilities with a modular engineering workflow, enabling teams to move from idea to implementation planning in minutes instead of hours.

---

# Author

**Shivam Kaushik**

Computer Science Engineer • Full Stack Developer • AI Enthusiast

---

If you found this project interesting, consider giving it a ⭐ on GitHub.
