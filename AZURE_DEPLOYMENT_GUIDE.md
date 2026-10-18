# ☁️ Microsoft Azure Deployment Guide for Bharath Krishi

This guide covers deploying the **Bharath Krishi AI Agriculture Platform** (FastAPI Backend + React Nginx Frontend + PostgreSQL) to **Microsoft Azure**.

---

## 🧭 Architecture on Microsoft Azure

```mermaid
graph TD
    User([Farmer / Browser]) -->|HTTPS Port 443| FrontendCA[Azure Container App: Frontend Nginx]
    FrontendCA -->|Internal /api| BackendCA[Azure Container App: FastAPI Backend]
    BackendCA -->|Port 5432 / SSL| AzurePG[(Azure Database for PostgreSQL Flexible Server)]
    BackendCA -->|Vision AI| Gemini[Google Gemini AI]
    BackendCA -->|Weather Telemetry| OpenMeteo[Open-Meteo Weather API]
```

---

## 🌟 Method 1: Azure Web App for Containers (Fastest & Simplest via Portal)

If you prefer using the **Azure Portal (Web UI)** without installing command-line tools:

### Step 1: Create PostgreSQL Database on Azure
1. Go to [Azure Portal](https://portal.azure.com/) and search for **Azure Database for PostgreSQL Flexible Servers**.
2. Click **Create**:
   - **Resource Group**: `rg-bharath-agri` (Create new)
   - **Server name**: `bharath-agri-db`
   - **Region**: Choose closest to you (e.g. `Central India` or `East US`)
   - **Workload type**: `Development` / `Burstable (Standard_B1ms)` (Cost-effective)
   - **Authentication**: Set admin username (e.g., `agriadmin`) and a strong password.
3. In **Networking**:
   - Check **"Allow public access from any Azure service within Azure to this server"**.
4. Once deployed, open the database server page, go to **Databases** on the left menu, and click **+ Add** to create a database named `agri`.

Your connection string will be:
```
postgresql://agriadmin:<PASSWORD>@bharath-agri-db.postgres.database.azure.com:5432/agri?sslmode=require
```

---

### Step 2: Deploy Multi-Container via Azure App Service
1. In Azure Portal, search for **App Services** and click **Create** > **Web App**.
2. Fill in the basics:
   - **Resource Group**: `rg-bharath-agri`
   - **Name**: `bharath-krishi-app` (must be unique, e.g. `bharath-krishi-live`)
   - **Publish**: Select **Docker Container**
   - **Operating System**: **Linux**
   - **Pricing Plan**: `Basic B1` (or `Free F1 / Shared D1` for testing)
3. In the **Docker** tab:
   - **Options**: Select **Docker Compose**
   - **Image Source**: Select **Docker Hub** or upload `docker-compose.yml`
4. Under **Configuration / Application Settings**, add:
   - `DATABASE_URL`: `postgresql://agriadmin:<PASSWORD>@bharath-agri-db.postgres.database.azure.com:5432/agri?sslmode=require`
   - `GEMINI_API_KEY`: Your Gemini API key
   - `ALLOWED_ORIGINS`: `*`
5. Click **Review + Create**. Azure will pull the containers, run Prisma migrations, and make your app live with an automatic HTTPS URL (`https://bharath-krishi-live.azurewebsites.net`).

---

## ⚡ Method 2: Azure Container Apps (Modern Serverless Microservices)

Azure Container Apps (ACA) is Microsoft's serverless container platform that automatically manages HTTPS certificates, scales on demand, and reduces idle costs.

### Prerequisites (Azure CLI)
If deploying via command-line, install Azure CLI on Windows (or run in Azure Cloud Shell):
```powershell
winget install Microsoft.AzureCLI
```

### 1. Login to Azure
```bash
az login
```

### 2. Create Resource Group & Infrastructure via Bicep
We have included a complete Bicep template in `deploy/azure-resources.bicep`:

```bash
# Set your deployment variables
RESOURCE_GROUP="rg-bharath-agri"
LOCATION="eastus" # or centralindia

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Deploy PostgreSQL, Container Registry, and Container Apps Environment
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file deploy/azure-resources.bicep \
  --parameters dbAdminPassword="YourStrongPassword123!"
```

### 3. Build & Push Docker Images to Azure Container Registry (ACR)
```bash
ACR_NAME="bharathagriacr"

# Build and push Backend image directly in Azure (no local Docker required!)
az acr build --registry $ACR_NAME --image bharath-backend:latest ./backend

# Build and push Frontend image
az acr build --registry $ACR_NAME --image bharath-frontend:latest ./frontend
```

### 4. Create the Container Apps
```bash
# 1. Deploy Backend Container App
az containerapp create \
  --name bharath-agri-backend \
  --resource-group $RESOURCE_GROUP \
  --environment bharathagri-cae \
  --image "$ACR_NAME.azurecr.io/bharath-backend:latest" \
  --target-port 8000 \
  --ingress external \
  --registry-server "$ACR_NAME.azurecr.io" \
  --env-vars \
    DATABASE_URL="postgresql://agriadmin:YourStrongPassword123!@bharathagri-pgserver.postgres.database.azure.com:5432/agri?sslmode=require" \
    ALLOWED_ORIGINS="*"

# 2. Deploy Frontend Container App
az containerapp create \
  --name bharath-agri-frontend \
  --resource-group $RESOURCE_GROUP \
  --environment bharathagri-cae \
  --image "$ACR_NAME.azurecr.io/bharath-frontend:latest" \
  --target-port 80 \
  --ingress external \
  --registry-server "$ACR_NAME.azurecr.io"
```

Azure will output your live URL: `https://bharath-agri-frontend.<unique-id>.azurecontainerapps.io`!

---

## 🔄 Method 3: Automated CI/CD with GitHub Actions

Whenever you push to the `main` branch, GitHub Actions can automatically build and deploy new code to Azure.

1. In your GitHub repository: [https://github.com/MehaboobS/ai-powered-agri-patner](https://github.com/MehaboobS/ai-powered-agri-patner)
2. Go to **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
3. Add the following secrets:
   - `AZURE_CREDENTIALS`: Output of `az ad sp create-for-rbac` (Service Principal JSON)
   - `ACR_NAME`: Your Azure Container Registry name (e.g. `bharathagriacr`)
   - `AZURE_RESOURCE_GROUP`: `rg-bharath-agri`
4. The workflow in [`.github/workflows/azure-deploy.yml`](.github/workflows/azure-deploy.yml) will trigger automatically on every `git push origin main`!
