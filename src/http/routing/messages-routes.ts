import { app } from '@/app'
import { createMessage } from '../routes/messages/create-message'
import { findMessagesByChat } from '../routes/messages/find-messages-by-chat'
import { readMessages } from '../routes/messages/read-messages'

export default function messagesRoutes() {
  app.register(createMessage)
  app.register(findMessagesByChat)
  app.register(readMessages)
}
