import type { NextConfig } from "next";
// @ts-expect-error - next-pwa does not have perfect TS support yet
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  turbopack: {},
  // Liberando enderecos locais comuns para evitar travamentos no celular
  allowedDevOrigins: ['localhost', '127.0.0.1', '54.232.189.113', '192.168.1.133'],
  /* config options here */
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})(nextConfig);
