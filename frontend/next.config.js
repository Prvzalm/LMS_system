/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enable static HTML export using the new Next 14 output option
    // `next export` CLI was removed; set output: 'export' to generate static files in out/ after build
    output: 'export',
    // Optional: set a custom output directory (Next will use `out` by default)
    // distDir: '.next',
}

module.exports = nextConfig;
