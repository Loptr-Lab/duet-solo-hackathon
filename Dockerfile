# Use ultra-lightweight Nginx alpine image
FROM nginx:alpine

# Copy all static app files into Nginx default web directory
COPY . /usr/share/nginx/html

# Cloud Run injects $PORT (usually 8080). Update Nginx to listen on 8080
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
