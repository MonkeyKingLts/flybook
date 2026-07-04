import { createApp } from './app.js'

const PORT = Number(process.env.PORT ?? 3001)

const app = createApp()

app.listen(PORT, () => {
  console.log(`Flybook API running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
