# Script-to-UI Web App

A modern web application that converts scripts into user-friendly interfaces. Upload your script, and we'll automatically generate an intuitive UI that allows non-technical users to interact with your code without writing a single line of code.

## 🚀 Project Overview

Script-to-UI is a full-stack application that bridges the gap between technical and non-technical users. It allows developers, data scientists, and engineers to share their scripts with colleagues, clients, or stakeholders by generating accessible web interfaces automatically.

### Core Features

- **Script Upload & Analysis**: Support for JavaScript and Python scripts
- **Automatic UI Generation**: Create intuitive interfaces based on script parameters
- **AI-Enhanced Experience**: Intelligent analysis of scripts and UI suggestions
- **Secure Script Execution**: Run scripts in isolated environments with resource limitations
- **Shareable Results**: Generate links to share created UIs with others
- **User Management**: Create accounts to manage and organize your scripts
- **Project Dashboard**: Track usage and manage multiple script-to-UI conversions

## 🛠️ Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: Material-UI v5
- **Form Validation**: Formik with Yup
- **Code Editor**: Monaco Editor
- **Testing**: 
  - Unit/Integration: Jest with React Testing Library
  - E2E: Playwright

### Backend
- **Runtime**: Node.js 20+
- **API Framework**: Express.js
- **API Documentation**: Swagger/OpenAPI
- **Authentication**: JWT with refresh tokens
- **Script Execution**: 
  - JavaScript: VM2 sandbox
  - Python: Docker containers with resource constraints
- **Validation**: Zod for schema validation
- **Testing**:
  - Unit: Jest
  - Integration: Supertest

### Database
- **Primary Database**: MongoDB
- **ODM**: Mongoose
- **Caching & Queue**: Redis

### AI Integration
- **Provider**: OpenAI API (GPT-4)
- **Features**:
  - Script analysis for parameter detection
  - UI element suggestions
  - Documentation generation
  - Error explanation and debugging assistance

### DevOps
- **Containerization**: Docker with Docker Compose
- **CI/CD**: GitHub Actions
- **Linting & Formatting**: ESLint, Prettier
- **Monitoring**: Prometheus with Grafana
- **Logging**: Winston, Morgan

## 🏗️ Architecture

The application follows a modular monolith architecture with clear separation of concerns, implementing microservices principles within a single deployable unit.

![Architecture Diagram](./docs/architecture-diagram.png)

### Key Components

#### Script Parser Service
Analyzes uploaded scripts to identify inputs, outputs, and execution patterns. Enhanced with AI for more accurate parameter detection and type inference.

#### UI Generator Service
Creates appropriate UI elements based on script parameters. Uses AI to suggest the most intuitive input components based on parameter names and expected data types.

#### Script Execution Engine
Safely runs user-provided scripts in isolated environments with strict resource limitations. Utilizes a job queue system for managing execution requests.

#### AI Service
Integrates with OpenAI API to provide intelligent features throughout the application, including script analysis, UI suggestions, documentation generation, and error explanation.

## 🔒 Security Considerations

- Sandboxed script execution with VM2 for JavaScript and Docker for Python
- Resource limiting to prevent DoS attacks
- Rate limiting on all API endpoints
- Comprehensive input validation and sanitization
- HTTPS-only with secure cookie configuration
- XSS and CSRF protection
- Regular dependency auditing

## 👨‍💻 Development Workflow

### Prerequisites
- Node.js (v20+)
- Docker and Docker Compose
- MongoDB (or use the Docker Compose setup)
- Redis (or use the Docker Compose setup)
- OpenAI API key

### Getting Started
1. Clone the repository
2. Set up environment variables (see `.env.example`)
3. Run `npm install` in both frontend and backend directories
4. Start the development environment with `docker-compose up -d`
5. Run the backend with `npm run dev` in the backend directory
6. Run the frontend with `npm start` in the frontend directory

### Testing
- Run unit tests: `npm test`
- Run integration tests: `npm run test:integration`
- Run E2E tests: `npm run test:e2e`

### CI/CD Pipeline
The project uses GitHub Actions for continuous integration and deployment:
1. Code Quality: ESLint, Prettier
2. Testing: Unit, Integration, E2E
3. Security: Dependency scanning
4. Build: Docker image creation
5. Deploy: Automatic deployment to development/staging/production

## 📂 Project Structure

```
script-to-ui/
├── frontend/                # React application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature-based modules
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API clients and services
│   │   ├── store/           # Redux store configuration
│   │   └── utils/           # Utility functions
│   ├── tests/               # Test files
│   │   ├── unit/            # Unit tests
│   │   ├── integration/     # Integration tests
│   │   └── e2e/             # End-to-end tests
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Express server
│   ├── src/                 # Source code
│   │   ├── api/             # API routes
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Express middlewares
│   │   ├── models/          # Mongoose models
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── app.js           # Express application
│   ├── tests/               # Test files
│   └── package.json         # Backend dependencies
│
├── docs/                    # Documentation
├── docker-compose.yml       # Docker Compose configuration
├── .github/                 # GitHub Actions workflows
└── README.md                # Project documentation
```

## 📝 Roadmap

### Phase 1: Core Functionality
- [x] Project setup and configuration
- [ ] User authentication system
- [ ] Script upload and basic analysis
- [ ] Simple UI generation
- [ ] Basic script execution

### Phase 2: Enhanced Features
- [ ] AI integration for script analysis
- [ ] Advanced UI customization
- [ ] Script execution engine improvements
- [ ] Project management dashboard

### Phase 3: Polishing & Optimization
- [ ] Performance optimization
- [ ] Enhanced security measures
- [ ] Comprehensive testing
- [ ] Documentation and examples

## 🔗 Additional Resources

- [Design Docs](./docs/design.md)
- [API Documentation](./docs/api.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
