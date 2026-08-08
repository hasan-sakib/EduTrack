FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY src/EduTrack.Domain/EduTrack.Domain.csproj src/EduTrack.Domain/
COPY src/EduTrack.Application/EduTrack.Application.csproj src/EduTrack.Application/
COPY src/EduTrack.Infrastructure/EduTrack.Infrastructure.csproj src/EduTrack.Infrastructure/
COPY src/EduTrack.Persistence/EduTrack.Persistence.csproj src/EduTrack.Persistence/
COPY src/EduTrack.Api/EduTrack.Api.csproj src/EduTrack.Api/
RUN dotnet restore src/EduTrack.Api/EduTrack.Api.csproj

COPY src/ src/
RUN dotnet publish src/EduTrack.Api/EduTrack.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

RUN groupadd --gid 5678 edutrack \
    && useradd --uid 5678 --gid 5678 --no-create-home edutrack \
    && mkdir -p /app/logs \
    && chown -R edutrack:edutrack /app

COPY --from=build /app/publish .
RUN chown -R edutrack:edutrack /app

USER edutrack
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "EduTrack.Api.dll"]
