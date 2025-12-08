# Step 1: Build jar with Maven
FROM maven:3.9.3-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven config and pom
COPY pom.xml .
COPY src ./src

# Build jar
RUN mvn clean package -DskipTests

# Step 2: Run jar
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy jar từ stage build
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
