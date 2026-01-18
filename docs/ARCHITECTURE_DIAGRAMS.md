# Architecture Diagrams

Visual documentation of the **In Midst My Life** system architecture using Mermaid diagrams.

---

## System Overview

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        BROWSER[Web Browser]
        MOBILE[Mobile App<br/>Future]
    end
    
    subgraph "Application Layer"
        WEB[Next.js Frontend<br/>Port 3000]
        API[Fastify API<br/>Port 3001]
        ORCH[Orchestrator<br/>Port 3002]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Profiles, CV Data)]
        REDIS[(Redis<br/>Cache & Queue)]
        NEO4J[(Neo4j<br/>Graph Optional)]
    end
    
    subgraph "External Services"
        LLM[Local LLM<br/>Ollama]
        JOBS[Job Boards<br/>Serper API]
        STORAGE[File Storage<br/>S3/Local]
    end
    
    BROWSER -->|HTTPS| WEB
    MOBILE -.->|REST API| API
    WEB -->|REST| API
    WEB -->|REST| ORCH
    
    API --> PG
    API --> REDIS
    API -.-> NEO4J
    
    ORCH --> PG
    ORCH --> REDIS
    ORCH --> LLM
    ORCH --> JOBS
    
    API --> STORAGE
    
    style WEB fill:#61dafb
    style API fill:#ff6b6b
    style ORCH fill:#ffd93d
    style PG fill:#336791
    style REDIS fill:#dc382d
```

---

## Application Architecture

### Monorepo Structure

```mermaid
graph TB
    subgraph "Monorepo"
        ROOT[Root: pnpm workspace]
        
        subgraph "apps/"
            WEB[web<br/>Next.js 15]
            API[api<br/>Fastify]
            ORCH[orchestrator<br/>Workers]
        end
        
        subgraph "packages/"
            SCHEMA[schema<br/>Zod types]
            CORE[core<br/>Business logic]
            CONTENT[content-model<br/>Graph models]
            DESIGN[design-system<br/>UI components]
        end
        
        ROOT --> WEB
        ROOT --> API
        ROOT --> ORCH
        ROOT --> SCHEMA
        ROOT --> CORE
        ROOT --> CONTENT
        ROOT --> DESIGN
        
        WEB --> SCHEMA
        WEB --> DESIGN
        API --> SCHEMA
        API --> CORE
        API --> CONTENT
        ORCH --> SCHEMA
        ORCH --> CORE
        CORE --> SCHEMA
        CONTENT --> SCHEMA
    end
    
    style ROOT fill:#e3f2fd
    style WEB fill:#61dafb
    style API fill:#ff6b6b
    style ORCH fill:#ffd93d
    style SCHEMA fill:#9c27b0
    style CORE fill:#4caf50
    style CONTENT fill:#ff9800
    style DESIGN fill:#e91e63
```

---

## Data Flow

### Profile Retrieval with Mask Filter

```mermaid
sequenceDiagram
    participant User
    participant Web
    participant API
    participant Cache
    participant DB
    
    User->>Web: View Profile (maskId: analyst)
    Web->>API: GET /profiles/{id}?maskId=analyst
    
    API->>Cache: Check mask definition
    alt Cache Hit
        Cache-->>API: Return mask config
    else Cache Miss
        API->>DB: SELECT mask config
        DB-->>API: Mask config
        API->>Cache: Store mask config (TTL: 1h)
    end
    
    API->>DB: SELECT profile, experiences, skills
    DB-->>API: Profile data
    
    API->>API: Apply mask filter<br/>- Filter by tags<br/>- Apply weights<br/>- Adjust tone
    
    API-->>Web: Filtered profile JSON
    Web-->>User: Render profile view
```

### Narrative Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant Web
    participant API
    participant Orch
    participant Queue
    participant Worker
    participant LLM
    participant DB
    
    User->>Web: Request narrative
    Web->>API: POST /profiles/{id}/narrative
    API->>Orch: POST /tasks (type: generate_narrative)
    Orch->>Queue: Enqueue task
    Orch-->>API: Task ID
    API-->>Web: 202 Accepted, taskId
    Web-->>User: "Generating narrative..."
    
    Queue->>Worker: Dequeue task
    Worker->>DB: Fetch profile + experiences
    DB-->>Worker: Profile data
    
    Worker->>Worker: Build prompt from data
    Worker->>LLM: Generate narrative
    LLM-->>Worker: Generated text
    
    Worker->>DB: Store narrative blocks
    Worker->>Queue: Mark task complete
    
    Web->>API: GET /tasks/{taskId}
    API->>Orch: GET /tasks/{taskId}
    Orch-->>API: Status: completed
    API->>DB: Fetch narrative
    DB-->>API: Narrative blocks
    API-->>Web: Narrative JSON
    Web-->>User: Display narrative
```

---

## Hunter Protocol Architecture

### Job Search & Application Flow

```mermaid
graph TB
    subgraph "Hunter Protocol"
        SCHED[Job Hunt Scheduler]
        AGENT[Hunter Agent]
        
        subgraph "Tools"
            FIND[find_jobs]
            GAP[analyze_gap]
            TAILOR[tailor_resume]
            COVER[generate_cover]
        end
    end
    
    subgraph "External"
        SERPER[Serper API<br/>Job Search]
    end
    
    subgraph "Storage"
        JOBS_DB[(Job Postings)]
        APPS_DB[(Applications)]
    end
    
    SCHED -->|Trigger daily| AGENT
    AGENT --> FIND
    AGENT --> GAP
    AGENT --> TAILOR
    AGENT --> COVER
    
    FIND --> SERPER
    SERPER --> JOBS_DB
    
    GAP --> JOBS_DB
    GAP --> PROFILE[(Profile Data)]
    
    TAILOR --> JOBS_DB
    TAILOR --> PROFILE
    TAILOR --> MASK[(Mask Selection)]
    
    COVER --> JOBS_DB
    COVER --> PROFILE
    COVER --> LLM[Local LLM]
    
    COVER --> APPS_DB
    
    style SCHED fill:#ffd93d
    style AGENT fill:#ffd93d
    style SERPER fill:#64b5f6
    style LLM fill:#9575cd
```

### Hunter Agent Workflow

```mermaid
stateDiagram-v2
    [*] --> SearchJobs
    
    SearchJobs --> AnalyzeMatches: Jobs found
    SearchJobs --> [*]: No jobs found
    
    AnalyzeMatches --> SkillGapAnalysis: For each job
    
    SkillGapAnalysis --> GoodMatch: Gap < threshold
    SkillGapAnalysis --> PoorMatch: Gap > threshold
    
    GoodMatch --> TailorResume
    PoorMatch --> LogForLater
    
    TailorResume --> GenerateCoverLetter
    GenerateCoverLetter --> SaveApplication
    
    SaveApplication --> AnalyzeMatches: More jobs
    SaveApplication --> [*]: All jobs processed
    
    LogForLater --> AnalyzeMatches: More jobs
    LogForLater --> [*]: All jobs processed
```

---

## Deployment Architecture

### Docker Compose (Development)

```mermaid
graph TB
    subgraph "Docker Network"
        WEB[web container<br/>Next.js dev]
        API[api container<br/>Fastify dev]
        ORCH[orchestrator container<br/>Worker dev]
        
        PG[postgres container<br/>pgvector/pgvector:pg15]
        REDIS[redis container<br/>redis:7-alpine]
        NEO4J[neo4j container<br/>neo4j:5-community]
        
        MIG[migrations container<br/>One-time job]
    end
    
    subgraph "Host Machine"
        CODE[Source Code<br/>Volume Mount]
        OLLAMA[Ollama<br/>host.docker.internal:11434]
    end
    
    WEB -->|http://api:3001| API
    WEB -->|http://orchestrator:3002| ORCH
    API -->|postgres:5432| PG
    API -->|redis:6379| REDIS
    ORCH -->|postgres:5432| PG
    ORCH -->|redis:6379| REDIS
    ORCH -.->|http://host.docker.internal:11434| OLLAMA
    
    MIG -->|postgres:5432| PG
    
    CODE -.->|mount| WEB
    CODE -.->|mount| API
    CODE -.->|mount| ORCH
    
    style WEB fill:#61dafb
    style API fill:#ff6b6b
    style ORCH fill:#ffd93d
    style PG fill:#336791
    style REDIS fill:#dc382d
    style NEO4J fill:#008cc1
```

### Kubernetes (Production)

```mermaid
graph TB
    subgraph "Ingress"
        ING[NGINX Ingress<br/>TLS Termination]
    end
    
    subgraph "Application Pods"
        WEB1[web-0]
        WEB2[web-1]
        API1[api-0]
        API2[api-1]
        ORCH1[orch-0]
        ORCH2[orch-1]
        ORCH3[orch-2]
    end
    
    subgraph "StatefulSets"
        PG[postgres-0<br/>PVC: 50Gi]
        REDIS[redis-0<br/>PVC: 10Gi]
    end
    
    subgraph "Jobs"
        MIG[migration-job]
        SEED[seed-job]
        BACKUP[backup-cronjob]
    end
    
    subgraph "Secrets"
        SECRETS[ConfigMap/Secrets<br/>- DB credentials<br/>- JWT secret<br/>- API keys]
    end
    
    ING -->|Service: web| WEB1
    ING -->|Service: web| WEB2
    ING -->|Service: api| API1
    ING -->|Service: api| API2
    
    WEB1 --> API1
    WEB2 --> API2
    
    API1 --> PG
    API2 --> PG
    API1 --> REDIS
    API2 --> REDIS
    
    ORCH1 --> PG
    ORCH2 --> PG
    ORCH3 --> PG
    ORCH1 --> REDIS
    ORCH2 --> REDIS
    ORCH3 --> REDIS
    
    MIG -.->|init| PG
    SEED -.->|init| PG
    BACKUP -.->|daily| PG
    
    API1 -.-> SECRETS
    API2 -.-> SECRETS
    ORCH1 -.-> SECRETS
    ORCH2 -.-> SECRETS
    ORCH3 -.-> SECRETS
    
    style ING fill:#2e7d32
    style WEB1 fill:#61dafb
    style WEB2 fill:#61dafb
    style API1 fill:#ff6b6b
    style API2 fill:#ff6b6b
    style ORCH1 fill:#ffd93d
    style ORCH2 fill:#ffd93d
    style ORCH3 fill:#ffd93d
    style PG fill:#336791
    style REDIS fill:#dc382d
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    IDENTITY ||--o{ PROFILE : has
    PROFILE ||--o{ EXPERIENCE : contains
    PROFILE ||--o{ SKILL : contains
    PROFILE ||--o{ PROJECT : contains
    PROFILE ||--o{ CREDENTIAL : contains
    PROFILE ||--o{ ATTESTATION : contains
    PROFILE }o--|| EPOCH : "in stage"
    PROFILE }o--|| STAGE : "in epoch"
    
    IDENTITY {
        uuid id PK
        string did
        string primary_wallet_address
        string ens_name
        string email_hash
        jsonb identity_core
        timestamp created_at
    }
    
    PROFILE {
        uuid id PK
        uuid identity_id FK
        string slug UK
        string display_name
        string title
        text summary_markdown
        string avatar_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    EXPERIENCE {
        uuid id PK
        uuid profile_id FK
        string title
        string company
        string location
        date start_date
        date end_date
        boolean is_current
        text description
        text[] achievements
        text[] technologies
        text[] tags
    }
    
    SKILL {
        uuid id PK
        uuid profile_id FK
        string name
        string category
        string proficiency_level
        integer years_of_experience
        text[] tags
    }
    
    PROJECT {
        uuid id PK
        uuid profile_id FK
        string name
        text description
        string url
        date start_date
        string status
        text[] technologies
        text[] tags
    }
    
    CREDENTIAL {
        uuid id PK
        uuid profile_id FK
        string name
        string issuer
        timestamp issued_date
        timestamp expiry_date
        string credential_url
    }
```

### Mask & Taxonomy Tables

```mermaid
erDiagram
    MASK ||--o{ MASK_FILTER : has
    EPOCH ||--o{ PROFILE : stages
    STAGE ||--o{ PROFILE : epochs
    
    MASK {
        string id PK
        string name
        string ontology
        text functional_scope
        jsonb stylistic_parameters
        jsonb activation_rules
        jsonb filters
    }
    
    MASK_FILTER {
        uuid id PK
        string mask_id FK
        text[] include_tags
        text[] exclude_tags
        jsonb priority_weights
    }
    
    EPOCH {
        string id PK
        string name
        text description
        integer sort_order
    }
    
    STAGE {
        string id PK
        string name
        text description
        integer sort_order
    }
```

---

## Frontend Architecture

### Next.js App Structure

```mermaid
graph TB
    subgraph "App Router"
        ROOT[app/layout.tsx<br/>Root Layout]
        HOME[app/page.tsx<br/>Home]
        
        PROFILE_LAYOUT[app/profile/[id]/layout.tsx]
        PROFILE[app/profile/[id]/page.tsx]
        TIMELINE[app/profile/[id]/timeline/page.tsx]
        GRAPH[app/profile/[id]/graph/page.tsx]
        GALLERY[app/profile/[id]/gallery/page.tsx]
    end
    
    subgraph "Components"
        SERVER[Server Components<br/>- ProfileHeader<br/>- ExperienceList]
        CLIENT[Client Components<br/>- MaskSelector<br/>- TimelineGraph<br/>- GraphVisualization]
    end
    
    subgraph "Libraries"
        API_LIB[lib/api.ts<br/>API Client]
        TYPES[lib/types.ts<br/>TypeScript Types]
    end
    
    ROOT --> HOME
    ROOT --> PROFILE_LAYOUT
    PROFILE_LAYOUT --> PROFILE
    PROFILE_LAYOUT --> TIMELINE
    PROFILE_LAYOUT --> GRAPH
    PROFILE_LAYOUT --> GALLERY
    
    PROFILE --> SERVER
    PROFILE --> CLIENT
    TIMELINE --> CLIENT
    GRAPH --> CLIENT
    
    SERVER --> API_LIB
    CLIENT --> API_LIB
    API_LIB --> TYPES
    
    style ROOT fill:#e3f2fd
    style SERVER fill:#4caf50
    style CLIENT fill:#ff9800
    style API_LIB fill:#9c27b0
```

### Component Hierarchy

```mermaid
graph TB
    subgraph "Profile Page"
        PAGE[ProfilePage<br/>Server Component]
        
        subgraph "Server Components"
            HEADER[ProfileHeader]
            META[ProfileMeta]
        end
        
        subgraph "Client Components"
            SELECTOR[MaskSelector]
            TABS[ViewTabs]
            TIMELINE[TimelineView]
            GRAPH[GraphView]
            GALLERY[GalleryView]
        end
    end
    
    PAGE --> HEADER
    PAGE --> META
    PAGE --> SELECTOR
    PAGE --> TABS
    
    TABS --> TIMELINE
    TABS --> GRAPH
    TABS --> GALLERY
    
    TIMELINE --> D3[D3.js Timeline<br/>Dynamic Import]
    GRAPH --> FORCE[D3 Force Layout<br/>Dynamic Import]
    
    style PAGE fill:#61dafb
    style HEADER fill:#4caf50
    style META fill:#4caf50
    style SELECTOR fill:#ff9800
    style D3 fill:#f88379
    style FORCE fill:#f88379
```

---

## References

- [SPEC-002-system-design.md](../SPEC-002-system-design.md)
- [ARCH-001-system-architecture.md](../ARCH-001-system-architecture.md)
- [ADR 001: Monorepo Structure](./adr/001-monorepo-structure.md)
- [ADR 002: PostgreSQL Database](./adr/002-postgresql-primary-database.md)
- [ADR 003: Redis Caching](./adr/003-redis-caching-queue.md)
- [ADR 005: Mask System](./adr/005-mask-based-identity.md)
- [ADR 006: Next.js Frontend](./adr/006-nextjs-frontend.md)
