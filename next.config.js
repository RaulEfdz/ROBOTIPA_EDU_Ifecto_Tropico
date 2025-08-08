/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cambié "domains" por "remotePatterns" ya que "domains" está deprecado.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**", // Ruta para permitir todas las imágenes.
      },
      {
        protocol: "https",
        hostname: "example.com", // Añadir un hostname válido
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
        pathname: "/**",
      }
    ],
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
