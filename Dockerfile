FROM gradle:6.1.1-jdk11 as builder
WORKDIR /workspace/app
COPY settings.gradle build.gradle ./
RUN gradle dependencies > /dev/null
COPY src src
COPY ui ui
COPY config config
RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs
RUN gradle build unpack -x test -x check
WORKDIR /workspace/app/build/dependency
RUN jar -xf ../libs/*.jar

FROM openjdk:11-jre
VOLUME /tmp
EXPOSE 8080
ARG DEPENDENCY=/workspace/app/build/dependency
COPY --from=builder ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=builder ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=builder ${DEPENDENCY}/BOOT-INF/classes /app
ENTRYPOINT ["java","-cp","app:app/lib/*","de.wasenweg.alfred.AlfredApplication"]

