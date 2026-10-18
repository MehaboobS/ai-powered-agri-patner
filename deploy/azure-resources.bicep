@description('The location for all Azure resources.')
param location string = resourceGroup().location

@description('Prefix for resource names.')
param appPrefix string = 'bharathagri'

@description('PostgreSQL administrator login name.')
param dbAdminUser string = 'agriadmin'

@description('PostgreSQL administrator password.')
@secure()
param dbAdminPassword string

@description('Optional Google Gemini API Key for Plant Pathology Diagnostics.')
@secure()
param geminiApiKey string = ''

// 1. Azure Container Registry (ACR)
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: '${appPrefix}acr'
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// 2. Azure Database for PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: '${appPrefix}-pgserver'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '15'
    administratorLogin: dbAdminUser
    administratorLoginPassword: dbAdminPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
  }
}

// Allow Azure services to connect to PostgreSQL
resource pgFirewallRules 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Database creation
resource agriDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: 'agri'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// 3. Azure Log Analytics Workspace (for Container Apps monitoring)
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${appPrefix}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

// 4. Azure Container Apps Managed Environment
resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${appPrefix}-cae'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// Outputs
output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name
output postgresFqdn string = postgresServer.properties.fullyQualifiedDomainName
output containerAppEnvId string = containerAppEnv.id
