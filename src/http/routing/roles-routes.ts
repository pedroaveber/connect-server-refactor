import { app } from '@/app'
import { createRole } from '../routes/roles/create-role'
import { deleteRole } from '../routes/roles/delete-role'
import { getRoles } from '../routes/roles/get-roles'
import { updateRole } from '../routes/roles/update-roles'

export default function rolesRoutes() {
  app.register(createRole)
  app.register(deleteRole)
  app.register(getRoles)
  app.register(updateRole)
}
