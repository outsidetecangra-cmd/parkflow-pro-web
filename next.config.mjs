/** @type {import('next').NextConfig} */
const repo = "parkflow-pro-web";

const isPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(isPages
    ? {
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`
      }
    : {})
};

export default nextConfig;
