// notification-service/src/index.ts
import dotenv from 'dotenv'
dotenv.config()
import { startNotificationConsumer } from './services/notification.consumer'
import { initTopology } from './config/rabbitmq.config'

async function main() {
  await initTopology()
  await startNotificationConsumer()
  console.log('Notification service started')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
