# APG Project - Full Stack Application

Application full stack avec React (Frontend) et ASP.NET Core 8 (Backend) avec SQL Server.

## 📁 Structure du Projet

```
Apps/
├── APG_Front/              # Application Frontend React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
│
└── APG_Backend/            # API Backend ASP.NET Core 8
    ├── src/                # Code source
    ├── scripts/            # Scripts de migration
    ├── docs/               # Documentation complète
    ├── docker-compose.yml  # Orchestration Docker
    ├── Dockerfile          # Image Docker API
    └── README.md           # Documentation principale
```

## 🚀 Démarrage Rapide

### Frontend
```bash
cd APG_Front
npm install
npm run dev
```
Accès : http://localhost:5173

### Backend + Base de données
```bash
cd APG_Backend
docker compose up -d
```
Accès : http://localhost:5000/swagger

## 📚 Documentation

### Frontend
- [APG_Front/README.md](./APG_Front/README.md) - Documentation du frontend
- [APG_Front/AUTH0_SETUP.md](./APG_Front/AUTH0_SETUP.md) - Configuration Auth0

### Backend
- **[APG_Backend/README.md](./APG_Backend/README.md)** - Documentation principale du backend
- **[APG_Backend/docs/](./APG_Backend/docs/)** - Documentation complète :
  - `README_DB.md` - Guide complet de la base de données
  - `QUICKSTART.md` - Guide de démarrage rapide
  - `SETUP_GUIDE.md` - Configuration de l'environnement
  - `ARCHITECTURE.md` - Diagrammes d'architecture
  - `IMPLEMENTATION_CHECKLIST.md` - Suivi de progression
  - `SETUP_COMPLETE.md` - Résumé de la configuration

## 🔗 Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Application React |
| Backend API | http://localhost:5000 | API REST |
| Swagger UI | http://localhost:5000/swagger | Documentation API |
| SQL Server | localhost:1433 | Base de données |

## 🛠️ Technologies

### Frontend
- React 18 + TypeScript
- Vite
- Auth0
- PrimeReact
- Axios

### Backend
- ASP.NET Core 8
- Entity Framework Core 8
- SQL Server 2022
- Clean Architecture
- Docker + Docker Compose

## 📝 Notes

- Le frontend et le backend sont indépendants
- Le backend inclut `docker-compose.yml` pour SQL Server
- Toute la documentation backend est dans `APG_Backend/docs/`
- Le frontend communique avec le backend via http://localhost:5000

## 🎯 Prochaines Étapes

1. **Démarrer le backend** : `cd APG_Backend && docker compose up -d`
2. **Démarrer le frontend** : `cd APG_Front && npm run dev`
3. **Consulter la documentation** : Voir `APG_Backend/docs/`

---

**Dernière mise à jour** : 4 décembre 2025

## 📁 Project Overview

```
Apps/
├── APG_Front/              React + Vite frontend application
├── APG_Backend/            ASP.NET Core 8 Web API backend
├── docker-compose.yml      Orchestrates SQL Server + API
└── Documentation files...
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (for local development)
- [Node.js](https://nodejs.org/) (for frontend)

### Start Everything

```bash
# 1. Start Backend + Database
docker compose up -d

# 2. Verify backend is running
./verify-startup.sh    # macOS/Linux
verify-startup.bat     # Windows

# 3. Start Frontend (in another terminal)
cd APG_Front
npm install
npm run dev
```

### Access the Applications

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | (Your Auth0 config) |
| **Backend API** | http://localhost:5000 | N/A |
| **Swagger UI** | http://localhost:5000/swagger | N/A |
| **Health Check** | http://localhost:5000/health | N/A |
| **SQL Server** | localhost,1433 | sa / YourStrong@Passw0rd |

## 📚 Documentation

### Getting Started
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute quick start guide
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete development environment setup
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture diagrams and data flow

### Backend Documentation
- **[APG_Backend/README.md](./APG_Backend/README.md)** - Backend overview and API documentation
- **[APG_Backend/README_DB.md](./APG_Backend/README_DB.md)** - Comprehensive database guide
- **[APG_Backend/SETUP_SUMMARY.md](./APG_Backend/SETUP_SUMMARY.md)** - What was created and how to use it

### Frontend Documentation
- **[APG_Front/README.md](./APG_Front/README.md)** - Frontend documentation
- **[APG_Front/AUTH0_SETUP.md](./APG_Front/AUTH0_SETUP.md)** - Auth0 configuration

## 🏗️ Architecture

### Frontend (APG_Front)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS + Responsive Design
- **Authentication**: Auth0
- **State Management**: React Hooks
- **UI Components**: Custom components + PrimeReact

### Backend (APG_Backend)
- **Framework**: ASP.NET Core 8
- **Architecture**: Clean Architecture (Domain, Application, Persistence, API)
- **Database**: Entity Framework Core 8 + SQL Server 2022
- **API Documentation**: Swagger/OpenAPI
- **Health Checks**: Built-in health monitoring

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: SQL Server 2022 (Linux container)
- **Networking**: Custom Docker bridge network
- **Data Persistence**: Named Docker volumes

## 🔄 Development Workflow

### Backend Development

```bash
# Option 1: Full Docker (Recommended for testing)
docker compose up -d

# Option 2: Local API + Docker SQL Server (Recommended for development)
docker compose up sqlserver -d
cd APG_Backend/src/APG.API
dotnet run

# Create database migration
cd APG_Backend
./scripts/create-migration.sh AddNewFeature

# Apply migrations
./scripts/update-database.sh
```

### Frontend Development

```bash
cd APG_Front
npm run dev           # Development server
npm run build         # Production build
npm run preview       # Preview production build
```

### Full Stack Testing

1. Start backend: `docker compose up -d`
2. Start frontend: `cd APG_Front && npm run dev`
3. Access: http://localhost:5173
4. Backend API calls will go to http://localhost:5000

## 🧪 Testing

### Test Backend API

**Using Swagger UI:**
- Open: http://localhost:5000/swagger
- Test endpoints directly in the browser

**Using curl:**
```bash
# Health check
curl http://localhost:5000/health

# Get all test entities
curl http://localhost:5000/api/Test

# Create test entity
curl -X POST http://localhost:5000/api/Test \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Sample","isActive":true}'
```

### Test Frontend
- Open: http://localhost:5173
- Navigate through the application
- Check browser console for errors
- Test authentication flow

## 🗄️ Database Management

### Using Visual Studio SQL Server Object Explorer

1. **Open Visual Studio 2022**
2. View → SQL Server Object Explorer
3. Right-click "SQL Server" → Add SQL Server
4. Server: `localhost,1433`
5. Authentication: SQL Server Authentication
6. Login: `sa` / Password: `YourStrong@Passw0rd`
7. Connect → Browse to `APGDb`

### Using Command Line

```bash
# Connect to SQL Server
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd"

# Run queries
USE APGDb;
GO
SELECT * FROM TestEntities;
GO
```

### Using SQL Server Management Studio (Windows)

1. Server name: `localhost,1433`
2. Authentication: SQL Server Authentication
3. Login: `sa` / Password: `YourStrong@Passw0rd`
4. Connect

## 🔐 Security

### Current Setup (Development)
- ⚠️ SQL Server password in config files (development only)
- ⚠️ CORS enabled for localhost origins
- ⚠️ TrustServerCertificate enabled for SQL connection

### Production Recommendations
- ✅ Use Azure Key Vault or similar for secrets
- ✅ Enable HTTPS everywhere
- ✅ Implement JWT authentication
- ✅ Restrict CORS to specific domains
- ✅ Use proper SSL certificates
- ✅ Enable rate limiting
- ✅ Implement input validation
- ✅ Add logging and monitoring

### Securing Passwords Locally

**Backend:**
```bash
cd APG_Backend/src/APG.API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=APGDb;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True"
```

**Docker:**
- Use Docker secrets
- Or environment variables (not in docker-compose.yml)

## 🐳 Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove data (⚠️ deletes database)
docker compose down -v

# Restart a service
docker compose restart api

# Rebuild after code changes
docker compose build api
docker compose up -d

# View running containers
docker compose ps

# Execute command in container
docker compose exec api bash
docker compose exec sqlserver bash
```

## 🛠️ Troubleshooting

### Backend Issues

**API not starting:**
```bash
docker compose logs api
```

**Database connection fails:**
```bash
docker compose logs sqlserver
# Wait for: "SQL Server is now ready for client connections"
```

**Port conflicts:**
```bash
# macOS/Linux
lsof -i :1433
lsof -i :5000

# Windows
netstat -ano | findstr :1433
netstat -ano | findstr :5000
```

**Reset everything:**
```bash
docker compose down -v
docker compose up -d
```

### Frontend Issues

**Dependencies error:**
```bash
cd APG_Front
rm -rf node_modules package-lock.json
npm install
```

**Build fails:**
```bash
npm run build -- --debug
```

**API connection fails:**
- Check `src/services/api.ts` for correct backend URL
- Ensure backend is running on http://localhost:5000
- Check CORS configuration in backend

## 📊 Project Status

### ✅ Completed
- Docker Compose configuration
- SQL Server 2022 setup with persistence
- ASP.NET Core 8 Web API with Clean Architecture
- Entity Framework Core 8 with migrations
- Sample entity and CRUD endpoints
- Swagger UI documentation
- Health checks
- CORS configuration
- React frontend with Auth0
- Comprehensive documentation

### 🚧 In Progress / Next Steps
- [ ] Connect frontend to backend API
- [ ] Implement full authentication flow
- [ ] Add business entities specific to your domain
- [ ] Create integration tests
- [ ] Set up CI/CD pipeline
- [ ] Production deployment configuration

## 🤝 Contributing

### Adding New Features

**Backend:**
1. Create entity in `APG.Domain/Entities`
2. Add to `AppDbContext` in `APG.Persistence`
3. Create migration: `./scripts/create-migration.sh AddFeature`
4. Apply migration: `./scripts/update-database.sh`
5. Create controller in `APG.API/Controllers`

**Frontend:**
1. Create component in `APG_Front/src/components`
2. Add page in `APG_Front/src/pages`
3. Update routing
4. Test and commit

## 📞 Getting Help

### Documentation
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Backend**: [APG_Backend/README.md](./APG_Backend/README.md)
- **Database**: [APG_Backend/README_DB.md](./APG_Backend/README_DB.md)

### Verification Script
```bash
./verify-startup.sh     # macOS/Linux
verify-startup.bat      # Windows
```

This will check:
- Docker is running
- Containers are running
- SQL Server is accessible
- API health check passes
- Ports are available

## 🎯 Success Checklist

Before you start developing:

- [ ] Docker Desktop installed and running
- [ ] .NET 8 SDK installed
- [ ] Node.js installed
- [ ] `docker compose up -d` successful
- [ ] Backend health check passes (http://localhost:5000/health)
- [ ] Swagger UI accessible (http://localhost:5000/swagger)
- [ ] Frontend starts successfully (`npm run dev`)
- [ ] Visual Studio connected to SQL Server
- [ ] Can create/read test entities via Swagger
- [ ] All documentation reviewed

## 📈 Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Auth0
- PrimeReact
- Axios

### Backend
- ASP.NET Core 8
- Entity Framework Core 8
- SQL Server 2022
- Swagger/OpenAPI
- Clean Architecture

### DevOps
- Docker
- Docker Compose
- Git

### Tools
- Visual Studio 2022 / VS Code / Rider
- SQL Server Management Studio / Azure Data Studio
- Postman / Swagger UI

## 📝 License

[Your License Here]

---

## 🚀 Ready to Start?

1. **First time?** Read [QUICKSTART.md](./QUICKSTART.md)
2. **Setting up environment?** Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. **Working with database?** Read [APG_Backend/README_DB.md](./APG_Backend/README_DB.md)
4. **Need help?** Run `./verify-startup.sh` to check your setup

**Happy coding!** 🎉

---

**Last Updated**: December 4, 2025
