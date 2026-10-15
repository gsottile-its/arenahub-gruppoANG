# ---------- 1) build di Angular ----------
FROM node:24-alpine AS build
WORKDIR /app

# prima solo package*.json: npm ci resta in cache finché le dipendenze non cambiano
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production

# ---------- 2) nginx serve il sito e inoltra /api al backend ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
