import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';

// Optional HTTPS for Web Bluetooth testing from another device (phone/tablet).
// localhost already works over plain HTTP (it is a secure context), so this is
// only needed for LAN access. Generate certs once:
//   mkdir -p .cert && openssl req -x509 -newkey rsa:2048 -nodes \
//     -keyout .cert/key.pem -out .cert/cert.pem -days 365 -subj "/CN=localhost"
// then run `npm run dev -- --host` and open https://<PC-IP>:5181 on the device.
const keyPath = '.cert/key.pem';
const certPath = '.cert/cert.pem';
const https =
  existsSync(keyPath) && existsSync(certPath)
    ? { key: readFileSync(keyPath), cert: readFileSync(certPath) }
    : undefined;

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5181, https },
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
});
