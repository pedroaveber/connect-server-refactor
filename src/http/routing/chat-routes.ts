import { app } from '@/app'
import { createChat } from '../routes/chat/create-chat'
import { deleteChat } from '../routes/chat/delete-chat'
import { getChats } from '../routes/chat/get-chats'

export default function chatRoutes() {
  app.register(createChat)
  app.register(deleteChat)
  app.register(getChats)
}
