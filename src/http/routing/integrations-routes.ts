import { app } from '@/app'
import { createIntegration } from '../routes/integrations/create-integration'
import { deleteIntegration } from '../routes/integrations/delete-integration'
import { getIntegrations } from '../routes/integrations/get-integrations'
import { updateIntegration } from '../routes/integrations/update-integration'

export default function integrationsRoutes() {
  app.register(createIntegration)
  app.register(deleteIntegration)
  app.register(getIntegrations)
  app.register(updateIntegration)
}
