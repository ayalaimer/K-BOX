# שלב 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# העתק package files
COPY package*.json ./

# התקן את כל התלויות (כולל dev dependencies)
RUN npm ci

# העתק קוד המקור
COPY . .

# בנה את הפרויקט
RUN npm run build

# שלב 2: Production
FROM nginx:alpine

# העתק את הקבצים הסטטיים מהשלב הקודם
COPY --from=builder /app/dist /usr/share/nginx/html

# העתק הגדרות nginx מותאמות אישית (אופציונלי)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# חשוף פורט 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]