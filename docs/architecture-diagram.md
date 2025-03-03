```mermaid
flowchart TD
    subgraph "Client Side"
        A[User Interface - React] --> |Uploads/Creates Script| B[Script Editor Component]
        A --> |Configures UI Elements| C[UI Configuration Component]
        A --> |Views Generated App| D[Preview Component]
        A --> |Manages Projects| E[Project Management Dashboard]
    end

    subgraph "Frontend Services"
        B --> F[Script Validation Service]
        C --> G[UI Generation Service]
        E --> H[User Authentication]
        E --> I[Project State Management]
    end

    subgraph "API Layer"
        J[API Gateway - Express.js] --> K[Authentication Controller]
        J --> L[Script Controller]
        J --> M[UI Controller]
        J --> N[Execution Controller]
        J --> O[Project Controller]
        J --> AI_C[AI Integration Controller]
    end

    subgraph "Backend Services"
        K --> P[JWT Auth Service]
        L --> Q[Script Parser Service]
        L --> R[Script Validation Service]
        M --> S[UI Generator Service]
        N --> T[Script Execution Engine]
        O --> U[Project Management Service]
        AI_C --> AI[AI Service]
    end

    subgraph "AI Integration"
        AI --> AI1[Script Analysis]
        AI --> AI2[UI Element Suggestion]
        AI --> AI3[Documentation Generation]
        AI --> AI4[Error Explanation]
        AI1 & AI2 & AI3 & AI4 --> AIAPI[OpenAI API]
    end

    subgraph "Caching & Queue"
        REDIS[Redis] --> RD1[Results Cache]
        REDIS --> RD2[Job Queue]
        REDIS --> RD3[Rate Limiting]
        REDIS --> RD4[Session Store]
    end

    subgraph "Security Layer"
        T --> V[Script Sandbox Environment]
        V --> W[Resource Limiting]
        V --> X[Code Isolation]
    end

    subgraph "Database"
        Y[(MongoDB - Projects)]
        Z[(MongoDB - Users)]
        AA[(MongoDB - Generated UIs)]
    end

    P -.-> Z
    Q -.-> Y
    S -.-> AA
    U -.-> Y
    U -.-> AA
    T -.-> REDIS
    N -.-> REDIS

    subgraph "DevOps"
        AB[CI/CD Pipeline - GitHub Actions]
        AC[Docker Containers]
        AD[Testing - Jest, RTL & Playwright]
        AE[Monitoring - Prometheus & Grafana]
    end
