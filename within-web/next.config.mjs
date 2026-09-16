/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/ebook': ['./assets/**'],
  },
};

export default nextConfig;
