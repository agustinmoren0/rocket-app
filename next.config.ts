import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Configuración de Next.js */

  // Redirecciones para estructura de landing + app
  async redirects() {
    return [
      // Redirigir raíz a landing
      {
        source: "/",
        destination: "/landing",
        permanent: false, // false para que sea flexible durante desarrollo
      },
    ];
  },

  // Headers personalizados
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
