import { app } from "@/app";
import { createChat } from "@/http/controllers/chats/create-chat";
import { deleteChat } from "@/http/controllers/chats/delete-chat";
import { getChatMessages } from "@/http/controllers/chats/get-chat-messages";
import { getChats } from "@/http/controllers/chats/get-chats";
import { getUnreadChatMessages } from "@/http/controllers/chats/get-unread-chat-messages";
import { readChat } from "@/http/controllers/chats/read-chat";
import { sendMessage } from "@/http/controllers/chats/send-message";

export default function chatRoutes() {
  app.register(createChat);
  app.register(deleteChat);
  app.register(sendMessage);
  app.register(getChats);
  app.register(getChatMessages);
  app.register(readChat);
  app.register(getUnreadChatMessages);
}
