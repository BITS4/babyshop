import pino from "pino"

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: {
    service: "babyshop-web",
    environment: process.env.NODE_ENV ?? "development",
  },
  redact: {
    paths: ["authorization", "token", "password", "secret", "clientSecret", "*.authorization"],
    censor: "[REDACTED]",
  },
})
