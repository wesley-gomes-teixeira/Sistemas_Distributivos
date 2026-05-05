FROM node:20-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY users-service ./users-service
COPY assets-service ./assets-service
COPY tickets-service ./tickets-service
COPY gateway-service ./gateway-service
COPY frontend-service ./frontend-service
COPY docker/render/start-web.sh /usr/local/bin/start-web.sh

RUN chmod +x /usr/local/bin/start-web.sh \
  && cd /workspace/users-service && npm install && npm run build \
  && cd /workspace/assets-service && npm install && npm run build \
  && cd /workspace/tickets-service && npm install && npm run build \
  && cd /workspace/gateway-service && npm install && npm run build \
  && cd /workspace/frontend-service && npm install && npm run build

EXPOSE 10000

CMD ["/usr/local/bin/start-web.sh"]
