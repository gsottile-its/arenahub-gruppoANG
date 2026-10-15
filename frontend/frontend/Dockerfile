# ---------- 1) compilazione con Maven ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# prima solo il pom: le dipendenze restano in cache finché il pom non cambia
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

COPY src ./src
RUN mvn -q -B -DskipTests package

# ---------- 2) immagine finale, solo Java runtime ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# le date di iscrizione sono in ora italiana: senza questo il container usa UTC
ENV TZ=Europe/Rome

EXPOSE 8080
ENTRYPOINT ["java", "-Duser.timezone=Europe/Rome", "-jar", "app.jar"]
