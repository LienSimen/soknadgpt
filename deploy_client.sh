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
    "Cache-Control": "public, max-age=0, must-revalidate"
  },
  "/assets/*": {
    "Cache-Control": "public, max-age=31536000, immutable"
  },
  "/*.js": {
    "Cache-Control": "public, max-age=31536000, immutable"
  },
  "/*.css": {
    "Cache-Control": "public, max-age=31536000, immutable"
  },
  "/*.png": {
    "Cache-Control": "public, max-age=2592000"
  },
  "/*.ico": {
    "Cache-Control": "public, max-age=2592000"
  },
  "/sitemap.xml": {
    "Cache-Control": "public, max-age=86400"
  },
  "/robots.txt": {
    "Cache-Control": "public, max-age=86400"
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
