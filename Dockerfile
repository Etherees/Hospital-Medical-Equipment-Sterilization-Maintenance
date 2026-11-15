# Multi-Stage Production Dockerfile for STERILFLOW
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build-backend
WORKDIR /backend
COPY backend-springboot/pom.xml .
COPY backend-springboot/src ./src
RUN mvn clean package -DskipTests

FROM node:20-alpine AS build-frontend
WORKDIR /frontend
COPY frontend-react/package*.json ./
RUN npm ci
COPY frontend-react/ .
RUN npm run build

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build-backend /backend/target/sterilflow-backend-1.0.0.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
