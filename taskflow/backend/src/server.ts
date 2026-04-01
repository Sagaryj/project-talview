import { app } from './app'
import { config } from './config'

app.listen(config.port, () => {
  console.log(`Taskflow auth backend listening on http://localhost:${config.port}`)
})
