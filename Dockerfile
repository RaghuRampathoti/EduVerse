# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend
FROM maven:3.9.4-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
# Download dependencies to cache them
RUN mvn dependency:go-offline -B
COPY backend/src ./src
# Copy the built frontend static files to Spring Boot's static resources directory
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
# Build the application
RUN mvn clean package -DskipTests

# Stage 3: Setup the runtime environment
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/target/eduverse-backend.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
