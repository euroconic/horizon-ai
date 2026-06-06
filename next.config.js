/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse is a CommonJS lib that must run on the Node server, not be bundled.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

module.exports = nextConfig;
