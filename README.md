@"
# IT Incident Platform

Una plataforma fullstack de gestión de tickets de incidentes TI, diseñada como proyecto de portafolio para demostrar experiencia en **arquitectura cloud-native, containerización, orquestación Kubernetes, y CI/CD**.

## 🎯 Objetivo

Demostrar competencias en:
- **Backend moderno:** Spring Boot 3.x con JPA/Hibernate, REST APIs, patrones de arquitectura
- **Frontend declarativo:** Angular 22 con componentes standalone y renderizado del lado del servidor (SSR)
- **Infraestructura como código:** Docker multi-stage, Docker Compose, Kubernetes local (\`kind\`), configuración declarativa
- **Debugging real:** documentación de problemas técnicos reales y sus soluciones
- **Decisiones arquitectónicas justificadas:** por qué cada herramienta fue elegida

## 📊 Stack Técnico

| Componente | Tecnología |
|---|---|
| **Backend** | Spring Boot 3.x (Java 21), Spring Data JPA, PostgreSQL 16 |
| **Frontend** | Angular 22 (standalone components, SSR) |
| **Contenedores** | Docker (multi-stage builds), Docker Compose |
| **Orquestación** | Kubernetes (\`kind\`) — cluster local, configuración declarativa |
| **Infraestructura** | Terraform (fases futuras), GitHub Actions (CI/CD en progreso) |

## 🏗️ Estructura del Proyecto

\`\`\`
it-incident-platform/
├── backend/                      # Spring Boot 3.x
│   ├── Dockerfile              # Multi-stage build
│   ├── pom.xml
│   ├── src/main/java/com/doppelu/incident_platform/
│   │   ├── model/              # Entidades (Ticket, Status, Priority)
│   │   ├── repository/         # Data access layer
│   │   └── controller/         # REST endpoints
│   └── src/main/resources/
│       └── application.yml      # Configuración Spring
├── frontend/                     # Angular 22
│   ├── Dockerfile              # Multi-stage build (Node 24 builder)
│   ├── angular.json
│   └── src/app/
│       ├── components/ticket-list/  # Dashboard principal
│       └── services/ticket.ts       # HTTP client para backend
├── infra/                        # Infraestructura
│   ├── k8s/                    # Kubernetes manifests
│   │   ├── kind-config.yaml
│   │   ├── secret.yaml         # BD credentials
│   │   ├── configmap.yaml      # Variables de entorno
│   │   ├── postgres-deployment.yaml
│   │   ├── backend-deployment.yaml
│   │   └── frontend-deployment.yaml
│   └── terraform/              # (Fase 4 — IaC declarativa)
├── docker-compose.yml           # Orquestación local
├── .gitignore
└── README.md
\`\`\`

## 🚀 Cómo Ejecutar

### Requisitos previos
- Docker & Docker Compose
- Git
- (Opcional) Kubernetes \`kind\` para reproducir el cluster

### Opción 1: Docker Compose (más simple)

\`\`\`bash
git clone https://github.com/doppelU/it-incident-platform.git
cd it-incident-platform

docker-compose up -d
\`\`\`

El stack estará disponible en:
- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:8080/api/tickets
- **Postgres:** localhost:5432 (credentials en \`.env\` o docker-compose.yml)

### Opción 2: Kubernetes local (\`kind\`)

\`\`\`bash
# Crear cluster
kind create cluster --config infra/k8s/kind-config.yaml

# Construir imágenes
docker build -t it-incident-platform-backend:latest backend/
docker build -t it-incident-platform-frontend:latest frontend/

# Cargarlas en el cluster
kind load docker-image it-incident-platform-backend:latest
kind load docker-image it-incident-platform-frontend:latest

# Aplicar manifests
kubectl apply -f infra/k8s/secret.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/postgres-deployment.yaml
kubectl apply -f infra/k8s/backend-deployment.yaml
kubectl apply -f infra/k8s/frontend-deployment.yaml

# Port-forward para acceso local
kubectl port-forward svc/frontend 4200:80 &
kubectl port-forward svc/backend 8080:8080 &
\`\`\`

Luego accede a http://localhost:4200

## 📚 Decisiones Arquitectónicas Clave

### 1. PostgreSQL en lugar de MySQL
- **Por qué:** Estándar en GCP (Cloud SQL), mejor soporte nativo de enums, sintaxis más limpia
- **Trade-off:** Menos universal que MySQL, pero mejor para cargas modernas

### 2. \`kind\` para Kubernetes local
- **Por qué:** Cluster real sin costo, reproducible, perfecto para CI/CD
- **Trade-off:** Solo para desarrollo/testing, no para producción

### 3. Docker multi-stage builds
- **Por qué:** Imágenes más livianas (builder layer descartado en la imagen final), mejor aprovechamiento de caché
- **Ejemplo:** Frontend builder (Node 24) → imagen final (solo dist/ en Nginx)

### 4. ConfigMap + Secret separados
- **Por qué:** Permite RBAC granular; Secret en base64 (nota: no es encriptación, solo encoding)
- **En producción:** se usaría HashiCorp Vault o equivalente

### 5. ClusterIP vs NodePort
- **PostgreSQL:** ClusterIP (acceso interno únicamente)
- **Backend/Frontend:** NodePort (alcanzables desde el navegador)
- **En producción:** Ingress o LoadBalancer

## 🐛 Problemas Técnicos Reales (y Soluciones)

Este proyecto documentó 7 problemas reales durante desarrollo — útiles como anécdotas en entrevistas técnicas:

### 1. JAVA_HOME mal configurado en Windows
**Síntoma:** \`mvnw.cmd\` no encontraba el JDK  
**Solución:** Verificar \`echo %JAVA_HOME%\` y setear correctamente en System Properties  
**Lección:** Los errores del build frecuentemente apuntan a PATH/ENV mal configurado

### 2. Mismatch de paquete Java
**Síntoma:** Spring no escaneaba \`TicketController\`, endpoints retornaban 404  
**Causa:** Carpeta física \`incident_platform\` (autogenerada) vs package \`incidentplatform\` (declarado)  
**Solución:** Renombrar carpeta a \`incident_platform\` para matchear el package  
**Lección:** Spring Boot requiere que la estructura de directorios coincida exactamente con el package

### 3. Java 25 vs 21
**Síntoma:** Error de compilación "release version 25 not supported"  
**Causa:** Spring Initializr generó \`pom.xml\` con java.version=25 por defecto  
**Solución:** Cambiar a \`<java.version>21</java.version>\` en pom.xml  
**Lección:** Siempre revisar archivos generados, no confiar ciegamente en defaults

### 4. Puertos ocupados (8080/5432)
**Síntoma:** Docker Compose falla al binding de puertos  
**Causa:** Procesos previos corriendo en los mismos puertos  
**Solución:** \`lsof -i :8080\` (macOS/Linux) o \`netstat -ano | findstr :8080\` (Windows), matar procesos  
**Lección:** Usar \`docker-compose down\` antes de \`up\` para limpiar contenedores previos

### 5. \`.dockerignore\` ausente
**Síntoma:** Build context de 242MB (con node_modules), falla en Windows por caracteres inválidos  
**Causa:** \`docker build\` incluye archivos innecesarios  
**Solución:** Crear \`.dockerignore\` excluyendo \`node_modules/\`, \`target/\`, \`.git/\`, etc.  
**Lección:** \`.dockerignore\` es tan importante como \`.gitignore\` — reduce build time y errores

### 6. SSRF host validation en Angular SSR
**Síntoma:** Angular 22 rechaza requests con header \`Host\` no reconocido (CVE reciente)  
**Causa:** Parche de seguridad en Angular 21.1.5+  
**Solución:** Variable de entorno \`NG_ALLOWED_HOSTS=localhost\`  
**Lección:** Mantener dependencias actualizadas implica revisar CHANGELOGs de seguridad

### 7. \`kind\` no ve imágenes de Docker Compose
**Síntoma:** \`ImagePullBackOff\` al aplicar manifests  
**Causa:** Cluster \`kind\` corre en Docker aislado, no comparte imágenes del host  
**Solución:** Usar \`kind load docker-image <image-name>\`  
**Lección:** Entender cómo se comunica entre capas de virtualización

## 📋 Fases de Desarrollo

- ✅ **Fase 0:** Setup repo, \`.gitignore\`, estructura de carpetas
- ✅ **Fase 1:** CRUD backend (Spring Boot + Postgres) + frontend (Angular dashboard) funcionando end-to-end local
- ✅ **Fase 2:** Dockerización completa: Dockerfiles multi-stage, \`docker-compose.yml\` con healthchecks
- ✅ **Fase 3:** Kubernetes local (\`kind\`): cluster, imágenes cargadas, manifests aplicados
- ⏳ **Fase 4:** Terraform provisionando \`kind\` de forma declarativa (IaC)
- ⏳ **Fase 5:** CI/CD con GitHub Actions (test → build → push → cluster efímero → deploy → smoke test → teardown)
- ⏳ **Fase 6:** Demo pública en Cloud Run (GCP), badge de GitHub Actions, portafolio en doppeldev.com
- ⏳ **Fase 7 (futuro):** Chatbot IA en Oracle Cloud Free Tier (ARM Ampere, 2 OCPU/12GB), provisionado con Terraform

## 🎓 Qué Aprendiste (desde cero)

- Kubernetes: concepto → \`kind\` cluster → Deployments, Services, ConfigMaps, Secrets
- Docker: Dockerfiles simples → multi-stage builds → \`.dockerignore\`
- Spring Boot: generador (Initializr) → CRUD básico → JPA/Hibernate → REST APIs
- Angular 22: nueva sintaxis (@for, @if) → componentes standalone → SSR
- Debugging: desde errores de PATH hasta CVEs de seguridad en Angular

## 🔗 Enlaces

- **GitHub:** https://github.com/doppelU/it-incident-platform
- **LinkedIn:** linkedin.com/in/david-ulloa-427aa9203

## 📝 Notas para Entrevistas

Este proyecto responde preguntas técnicas comunes:

1. **"¿Cómo explicas Kubernetes sin experiencia de producción?"**  
   → "Construí un cluster \`kind\` local, aplicué Deployments, Services, ConfigMaps, Secrets. Documenté por qué cada decisión (ClusterIP vs NodePort, etc.)."

2. **"¿Qué es Docker multi-stage?"**  
   → "Usar capas de builder (donde necesitas Node/Maven) y descartarlas en la imagen final. Reduce tamaño, aprovecha caché de Docker."

3. **"¿Cómo debugueaste errores reales?"**  
   → "Documenté 7 problemas reales: JAVA_HOME, mismatches de paquete Java, puertos ocupados, \`.dockerignore\`, etc. Cada uno enseñó algo."

4. **"¿Por qué PostgreSQL y no MySQL?"**  
   → "GCP usa Cloud SQL (Postgres), mejor soporte de enums, estándar en la industria moderna."

## 📄 Licencia

MIT

---

**Última actualización:** agosto 2026  
**Mantenedor:** David Ulloa (david.sebastian.ulloa97@gmail.com)
"@ | Set-Content -Path "README.md" -Encoding UTF8

# Verificar que se creó bien
Write-Host "README.md actualizado:"
type README.md | Select-Object -First 10

# Agregar, commiter y pushear
git add README.md
git commit -m "docs: Add comprehensive project README with architecture decisions and debugging stories"
git push

# Verificar
git log --oneline | Select-Object -First 2

Cópialo completo y ejecutalo. Una vez hecho, tu repo estará listo en GitHub con:

✅ Nombre correcto: it-incident-platform
✅ README profesional con arquitectura, decisiones, y problemas debugueados
✅ .gitignore limpio
✅ Privado

Después, enlazamos el proyecto en el CV y atacamos el resto de los problemas.

¿Ejecutaste el script?

deja el readme ahi entonces porque no se como cambiarlo desde powershell

Proceso de pensamiento

Dale, mucho más simple. Edita el README directamente en GitHub desde el browser:

Ve a https://github.com/doppelU/it-incident-platform
Clickea en README.md
Clickea el lápiz (edit icon) arriba a la derecha
Borra todo lo que hay
Copia y pega esto:
markdown
# IT Incident Platform

Una plataforma fullstack de gestión de tickets de incidentes TI, diseñada como proyecto de portafolio para demostrar experiencia en **arquitectura cloud-native, containerización, orquestación Kubernetes, y CI/CD**.

## 🎯 Objetivo

Demostrar competencias en:
- **Backend moderno:** Spring Boot 3.x con JPA/Hibernate, REST APIs, patrones de arquitectura
- **Frontend declarativo:** Angular 22 con componentes standalone y renderizado del lado del servidor (SSR)
- **Infraestructura como código:** Docker multi-stage, Docker Compose, Kubernetes local (`kind`), configuración declarativa
- **Debugging real:** documentación de problemas técnicos reales y sus soluciones
- **Decisiones arquitectónicas justificadas:** por qué cada herramienta fue elegida

## 📊 Stack Técnico

| Componente | Tecnología |
|---|---|
| **Backend** | Spring Boot 3.x (Java 21), Spring Data JPA, PostgreSQL 16 |
| **Frontend** | Angular 22 (standalone components, SSR) |
| **Contenedores** | Docker (multi-stage builds), Docker Compose |
| **Orquestación** | Kubernetes (`kind`) — cluster local, configuración declarativa |
| **Infraestructura** | Terraform (fases futuras), GitHub Actions (CI/CD en progreso) |

## 🏗️ Estructura del Proyecto

it-incident-platform/
├── backend/ # Spring Boot 3.x
│ ├── Dockerfile # Multi-stage build
│ ├── pom.xml
│ ├── src/main/java/com/doppelu/incident_platform/
│ │ ├── model/ # Entidades (Ticket, Status, Priority)
│ │ ├── repository/ # Data access layer
│ │ └── controller/ # REST endpoints
├── frontend/ # Angular 22
│ ├── Dockerfile # Multi-stage build (Node 24 builder)
│ ├── angular.json
│ └── src/app/
│ ├── components/ticket-list/ # Dashboard principal
│ └── services/ticket.ts # HTTP client para backend
├── infra/ # Infraestructura
│ ├── k8s/ # Kubernetes manifests
│ │ ├── kind-config.yaml
│ │ ├── secret.yaml
│ │ ├── configmap.yaml
│ │ ├── postgres-deployment.yaml
│ │ ├── backend-deployment.yaml
│ │ └── frontend-deployment.yaml
├── docker-compose.yml
├── .gitignore
└── README.md


## 🚀 Cómo Ejecutar

### Opción 1: Docker Compose (rápido)

```bash
git clone https://github.com/doppelU/it-incident-platform.git
cd it-incident-platform
docker-compose up -d
```

Acceso:
- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:8080/api/tickets

### Opción 2: Kubernetes local (`kind`)

```bash
# Crear cluster
kind create cluster --config infra/k8s/kind-config.yaml

# Construir imágenes
docker build -t it-incident-platform-backend:latest backend/
docker build -t it-incident-platform-frontend:latest frontend/

# Cargar en cluster
kind load docker-image it-incident-platform-backend:latest
kind load docker-image it-incident-platform-frontend:latest

# Aplicar manifests
kubectl apply -f infra/k8s/secret.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/postgres-deployment.yaml
kubectl apply -f infra/k8s/backend-deployment.yaml
kubectl apply -f infra/k8s/frontend-deployment.yaml

# Port-forward
kubectl port-forward svc/frontend 4200:80 &
kubectl port-forward svc/backend 8080:8080 &
```

## 📚 Decisiones Arquitectónicas

### PostgreSQL vs MySQL
- **Por qué:** Estándar en GCP (Cloud SQL), mejor soporte de enums, más moderno
- **Trade-off:** Menos universal, pero estándar actual en la industria

### `kind` para Kubernetes local
- **Por qué:** Cluster real sin costo, reproducible, perfecto para CI/CD
- **Trade-off:** Desarrollo/testing solo, no producción

### Docker multi-stage builds
- **Por qué:** Imágenes livianas (builder layer descartado), aprovecha caché
- **Ejemplo:** Node 24 builder → imagen final con solo `dist/` en Nginx

### ConfigMap + Secret separados
- **Por qué:** RBAC granular; Secret en base64 (encoding, no encriptación)
- **En prod:** HashiCorp Vault o similar

### ClusterIP vs NodePort
- **PostgreSQL:** ClusterIP (acceso interno)
- **Backend/Frontend:** NodePort (acceso desde navegador)
- **En prod:** Ingress o LoadBalancer

## 🐛 Problemas Técnicos Reales (Debugging Stories)

Documenté 7 problemas reales durante desarrollo — útiles como anécdotas SAR en entrevistas:

### 1. JAVA_HOME mal configurado
**Síntoma:** `mvnw.cmd` no encontraba JDK  
**Solución:** Setear correctamente en System Properties  
**Lección:** Errores de build = PATH/ENV mal configurado

### 2. Mismatch de paquete Java
**Síntoma:** Spring no escaneaba `TicketController`, endpoints retornaban 404  
**Causa:** Carpeta física `incident_platform` vs package `incidentplatform`  
**Solución:** Renombrar carpeta para matchear package  
**Lección:** Spring requiere exactitud en estructura de directorios

### 3. Java 25 vs 21
**Síntoma:** Error "release version 25 not supported"  
**Causa:** Spring Initializr generó pom.xml con java.version=25  
**Solución:** Cambiar a 21 en pom.xml  
**Lección:** Revisar archivos generados, no confiar en defaults

### 4. Puertos ocupados (8080/5432)
**Síntoma:** Docker Compose falla al binding  
**Solución:** `netstat -ano | findstr :8080` (Windows), matar procesos  
**Lección:** Usar `docker-compose down` antes de `up`

### 5. `.dockerignore` ausente
**Síntoma:** Build context 242MB, falla en Windows por caracteres inválidos  
**Solución:** Crear `.dockerignore` excluyendo `node_modules/`, `target/`, etc.  
**Lección:** `.dockerignore` es tan crítico como `.gitignore`

### 6. SSRF host validation en Angular SSR
**Síntoma:** Angular rechaza requests con header `Host` no reconocido  
**Causa:** CVE reciente en Angular 21.1.5+  
**Solución:** Variable de entorno `NG_ALLOWED_HOSTS=localhost`  
**Lección:** Mantener deps actualizadas = revisar CHANGELOGs

### 7. `kind` no ve imágenes de Docker Compose
**Síntoma:** `ImagePullBackOff` al aplicar manifests  
**Causa:** Cluster `kind` corre en Docker aislado  
**Solución:** `kind load docker-image <image-name>`  
**Lección:** Entender capas de virtualización

## 📋 Fases

- ✅ **Fase 0:** Setup repo, `.gitignore`, estructura
- ✅ **Fase 1:** CRUD backend + frontend funcionando end-to-end
- ✅ **Fase 2:** Dockerización completa con healthchecks
- ✅ **Fase 3:** Kubernetes local (`kind`) con manifests
- ⏳ **Fase 4:** Terraform provisionando `kind`
- ⏳ **Fase 5:** CI/CD con GitHub Actions (test → build → deploy)
- ⏳ **Fase 6:** Demo pública en Cloud Run
- ⏳ **Fase 7:** Chatbot IA en Oracle Cloud Free Tier

## 🎓 Aprendizajes Clave

- Kubernetes: concepto → `kind` → Deployments, Services, ConfigMaps, Secrets
- Docker: Dockerfiles simples → multi-stage → `.dockerignore`
- Spring Boot: Initializr → CRUD → JPA → REST APIs
- Angular 22: nueva sintaxis (@for, @if) → standalone → SSR
- Debugging: PATH/ENV → package mismatches → CVEs

## 🔗 Enlaces

- **GitHub:** https://github.com/doppelU/it-incident-platform
- **LinkedIn:** linkedin.com/in/david-ulloa-427aa9203

## 📝 Notas para Entrevistas

**"¿Cómo explicas Kubernetes sin producción?"**  
→ "Construí `kind` local, apliqué Deployments, Services, ConfigMaps, Secrets. Documenté arquitectura de cada decisión."

**"¿Qué es Docker multi-stage?"**  
→ "Builder layer (Node/Maven) descartado en imagen final. Reduce tamaño, aprovecha caché."

**"¿Cómo debugueaste?"**  
→ "Documenté 7 problemas reales: JAVA_HOME, package mismatches, puertos, `.dockerignore`, etc."

**"¿Por qué PostgreSQL?"**  
→ "Estándar GCP, mejor enums, moderno. MySQL es más universal, pero Postgres es industria hoy."

## 📄 Licencia

MIT

---

**Última actualización:** agosto 2026  
**Mantenedor:** David Ulloa
