import { app } from '@/app'
import { createUser } from '../routes/users/create-user'
import { deleteUser } from '../routes/users/delete-user'
import { findMe } from '../routes/users/find-me'
import { getUsers } from '../routes/users/get-users'
import { updateUser } from '../routes/users/update-user'

export default function usersRoute() {
  app.register(createUser)
  app.register(deleteUser)
  app.register(getUsers)
  app.register(updateUser)
  app.register(findMe)
}
