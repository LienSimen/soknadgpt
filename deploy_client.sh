#!/usr/bin/env bash

if [ -z "$REACT_APP_API_URL" ]
then
  echo "REACT_APP_API_URL is not set"
  exit 1
fi

wasp build
cd .wasp/build/web-app

npm install && REACT_APP_API_URL=$REACT_APP_API_URL npm run build

# Check if build directory exists
if [ ! -d "build" ]; then
  echo "Build directory not found. Build may have failed."
  exit 1
fi

cp -r build dist

# Enable gzip compression for static assets (only if files exist)
if [ -d "dist" ]; then
  find dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" \) -exec gzip -9 -k {} \; 2>/dev/null || true
fi

cat <<EOF > dist/headers.json
{
  "/": {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.google-analytics.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.cartadeapresentacao.pt https://www.google-analytics.com; frame-src 'self' https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  },
  "/assets/*": {
    "Cache-Control": "public, max-age=2592000, immutable",
    "X-Content-Type-Options": "nosniff"
  },
  "/*.js": {
    "Cache-Control": "public, max-age=2592000, immutable",
    "X-Content-Type-Options": "nosniff"
  },
  "/*.css": {
    "Cache-Control": "public, max-age=2592000, immutable",
    "X-Content-Type-Options": "nosniff"
  },
  "/*.png": {
    "Cache-Control": "public, max-age=2592000",
    "X-Content-Type-Options": "nosniff"
  },
  "/*.jpg": {
    "Cache-Control": "public, max-age=2592000",
    "X-Content-Type-Options": "nosniff"
  },
  "/*.jpeg": {
    "Cache-Control": "public, max-age=2592000",
    "X-Content-Type-Options": "nosniff"
  },
  "/*.gif": {
    "Cache-Control": "public, max-age=2592000",
    "X-Content-Type-Options": "nosniff"
  },
  "/*.svg": {
    "Cache-Control": "public, max-age=2592000",
    "X-Content-Type-Options": "nosniff"
  },
  "/*.webp": {
    "Cache-Control": "public, max-age=2592000",
    "X-Content-Type-Options": "nosniff"
  },
  "/*.ico": {
    "Cache-Control": "public, max-age=2592000",
    "X-Content-Type-Options": "nosniff"
  },
  "/*.woff": {
    "Cache-Control": "public, max-age=2592000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": "*"
  },
  "/*.woff2": {
    "Cache-Control": "public, max-age=2592000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": "*"
  },
  "/*.ttf": {
    "Cache-Control": "public, max-age=2592000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": "*"
  },
  "/*.eot": {
    "Cache-Control": "public, max-age=2592000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": "*"
  },
  "/*.otf": {
    "Cache-Control": "public, max-age=2592000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": "*"
  },
  "/manifest.json": {
    "Cache-Control": "public, max-age=86400",
    "X-Content-Type-Options": "nosniff"
  },
  "/sitemap.xml": {
    "Cache-Control": "public, max-age=86400",
    "X-Content-Type-Options": "nosniff"
  },
  "/robots.txt": {
    "Cache-Control": "public, max-age=86400",
    "X-Content-Type-Options": "nosniff"
  }
}
EOF

dockerfile_contents=$(cat <<EOF
FROM pierrezemb/gostatic
COPY ./dist/ /srv/http/
CMD [ "-fallback", "index.html", "-enable-logging" ]
EOF
)

dockerignore_contents=$(cat <<EOF
node_modules/
EOF
)

echo "$dockerfile_contents" > Dockerfile
echo "$dockerignore_contents" > .dockerignore

railway up --service client

exit 0
