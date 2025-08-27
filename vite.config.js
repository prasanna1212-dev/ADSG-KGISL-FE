import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host:"172.30.6.12",
    port:"3012",
 
    proxy:{
      "/api":{
        target:"http://172.30.6.12:3012",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      }
    }
  }
})