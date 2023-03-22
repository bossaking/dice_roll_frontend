
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

# Copy the built application to the default Nginx web root directory
COPY /dist/dice-roll-frontend .

# Set the command to start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
