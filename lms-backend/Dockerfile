# Stage 1: Build the app
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# Stage 2: Run the app
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Nhận biến môi trường từ Render
ARG MYSQL_PUBLIC_URL
ARG MYSQLUSER
ARG MYSQLPASSWORD
ARG JWT_SECRET
ARG AWS_ACCESS_KEY
ARG AWS_SECRET_KEY
ARG PORT

ENV MYSQL_PUBLIC_URL=${MYSQL_PUBLIC_URL}
ENV MYSQLUSER=${MYSQLUSER}
ENV MYSQLPASSWORD=${MYSQLPASSWORD}
ENV JWT_SECRET=${JWT_SECRET}
ENV AWS_ACCESS_KEY=${AWS_ACCESS_KEY}
ENV AWS_SECRET_KEY=${AWS_SECRET_KEY}
ENV PORT=${PORT:-8080}

COPY --from=build /app/target/*.jar app.jar

# Render cần port binding, nên dùng biến PORT
ENTRYPOINT ["sh", "-c", "java -Dserver.port=$PORT -jar app.jar"]
