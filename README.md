# RAG Dashboard - Document Intelligence System

A full-stack Retrieval-Augmented Generation (RAG) system that allows users to upload documents, ask questions, and receive AI-powered answers grounded in their uploaded content.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI    │    │   PostgreSQL    │
│   (React/TS)    │◄──►│   Backend    │◄──►│   (Metadata)    │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │
                         ┌────▼────┐         ┌─────────────────┐
                         │  Redis  │         │     Qdrant      │
                         │(Caching)│         │ (Vector Store)  │
                         └─────────┘         └─────────────────┘
                              │                       │
                    ┌─────────▼──────────┐    ┌───────▼────────┐
                    │    AI Pipeline     │    │   Embeddings   │
                    │                    │    │   (OpenAI)     │
                    │ ┌─────────────────┐│    └────────────────┘
                    │ │  Claude 3.5     ││
                    │ │ (Answer Gen)    ││    ┌────────────────┐
                    │ └─────────────────┘│    │   Document     │
                    │ ┌─────────────────┐│    │  Processing    │
                    │ │     OpenAI      ││    │ (PyPDF2/Text)  │
                    │ │  (Embeddings)   ││    └────────────────┘
                    │ └─────────────────┘│
                    └────────────────────┘
```

### Core Components

1. **Frontend (React + TypeScript)**
   - Modern, responsive interface with dark/light theme support
   - Document upload with drag-and-drop functionality
   - Real-time chat interface with typing indicators
   - Source citations and document references

2. **Backend (FastAPI)**
   - RESTful API with automatic documentation
   - JWT-based authentication system
   - Document processing and text extraction
   - Vector embedding generation and storage
   - RAG query processing with source attribution

3. **Database Layer**
   - **PostgreSQL**: User accounts, document metadata, chat history
   - **Qdrant**: Vector embeddings for semantic search
   - **Redis**: Query caching and session management

4. **AI Pipeline**
   - Document chunking and embedding generation
   - Semantic similarity search
   - Context-aware answer generation with citations

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.9+ (for backend development)

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd rag-dashboard
```

2. Create environment files:
```bash
# Backend environment
cp .env.example .env

# Configure your API keys and settings:
# OPENAI_API_KEY=your_openai_key
# CLAUDE_API_KEY=your_claude_key
# POSTGRES_URL=postgresql://user:pass@localhost:5432/ragdb
# REDIS_URL=redis://localhost:6379
# QDRANT_URL=http://localhost:6333
# JWT_SECRET_KEY=your_secret_key
```

3. Start all services:
```bash
docker-compose up -d
```

4. Access the application:
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - Qdrant Dashboard: http://localhost:6333/dashboard

### Development Mode

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - User login

### Document Management
- `POST /documents/upload` - Upload PDF document

### Query & Chat
- `POST /qa/query` - Ask question about documents

### Health & Status
- `GET /health` - Service health check
- `GET /status` - System status and metrics

## 🔧 Configuration

### Environment Variables

| Variable           | Description                  | Default |
|--------------------|------------------------------|---------|
| `OPENAI_API_KEY`   | OpenAI API key for LLM       | Required |
| `CLAUDE_API_KEY`   | CLAUDE API key for LLM       | Required |
| `POSTGRES_URL`     | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/ragdb` |
| `REDIS_URL`        | Redis connection string      | `redis://localhost:6379` |
| `QDRANT_URL`       | Qdrant vector database URL   | `http://localhost:6333` |
| `JWT_SECRET_KEY`   | JWT signing secret           | Random generated |
| `JWT_EXPIRE_HOURS` | JWT token expiration         | `24` |
| `MAX_FILE_SIZE_MB` | Maximum upload file size     | `10` |
| `LLM_MODEL`        | OpenAI chat model            | `gpt-3.5-turbo` |

### Docker Services

```yaml
services:
  frontend:     # React application (port 3000)
  backend:      # FastAPI server (port 8000)  
  postgres:     # PostgreSQL database (port 5432)
  redis:        # Redis cache (port 6379)
  qdrant:       # Vector database (port 6333)
```

## 🧪 Testing

Run the test suite:
```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests  
cd frontend
npm test

# Integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📱 Usage Examples

### 1. Document Upload
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('/documents/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 2. Ask Questions
```javascript
const response = await fetch('/query/ask', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: "What are the key findings in the document?"
  })
});

const data = await response.json();
console.log(data.answer, data.sources);
```

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Multi-tenant data isolation (users only see their documents)
- Input validation and sanitization
- Rate limiting on API endpoints
- File type and size restrictions
- SQL injection prevention with SQLAlchemy ORM

## 🎨 Frontend Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Dark Mode**: Full dark/light theme support
- **Real-time Chat**: Instant responses with typing indicators
- **File Upload**: Drag-and-drop with progress tracking
- **Source Citations**: Clickable references to source documents
- **Mobile Responsive**: Works seamlessly on all device sizes

## 🐳 Production Deployment

### Using Docker Compose

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# With SSL termination
docker-compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d
```

### Environment-specific Configurations

- **Development**: Auto-reload, debug logging, CORS enabled
- **Production**: Optimized builds, security headers, log aggregation
- **Testing**: Isolated databases, mock services, coverage reporting

## 📊 Monitoring & Observability

- Health check endpoints for all services
- Structured logging with correlation IDs  
- Performance metrics collection
- Error tracking and alerting
- Database query optimization

## 🔄 What I Would Do Next (Production Scaling)

### 1. **Enhanced Scalability**
- Implement horizontal scaling with load balancers
- Add message queues (Celery + RabbitMQ) for async document processing  
- Implement database read replicas and connection pooling
- Add CDN for frontend static assets and file storage

### 2. **Advanced AI Features**
- Multi-language document support with language detection
- Document summarization and automatic tagging
- Advanced retrieval strategies (hybrid search, re-ranking)
- Custom fine-tuned models for domain-specific use cases
- Conversation memory and context persistence

### 3. **Security & Compliance**
- OAuth2/SSO integration (Google, Microsoft, SAML)
- Role-based access control (RBAC) with granular permissions
- Data encryption at rest and in transit
- Audit logging and compliance reporting (GDPR, HIPAA)
- API rate limiting and DDoS protection

### 4. **Performance Optimization**
- Implement GraphQL for efficient data fetching
- Add full-text search capabilities with Elasticsearch
- Implement smart caching strategies with cache invalidation
- Database sharding for large-scale deployments
- Optimize embedding models for faster inference

### 5. **DevOps & Reliability**
- Kubernetes deployment with auto-scaling
- Comprehensive monitoring with Prometheus + Grafana
- Automated backup and disaster recovery procedures
- Blue-green deployments with automated rollbacks
- Infrastructure as Code (Terraform/Pulumi)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using FastAPI, React, and modern AI technologies**# RAG-Application
# RAG-Application
