/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.solars.solutions" }],
        destination: "https://solars.solutions/:path*",
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;
