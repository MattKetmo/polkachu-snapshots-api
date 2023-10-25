/** source/server.ts */
import http from "http"
import router from "./router"

const httpServer = http.createServer(router)
const PORT: any = process.env.PORT ?? 6060
httpServer.listen(PORT, () =>
  console.log(`The server is running on http://localhost:${PORT}`),
)
