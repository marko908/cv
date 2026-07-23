import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // W katalogu domowym użytkownika istnieje dodatkowy package-lock.json,
  // przez co Next błędnie zgaduje root workspace'u.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
