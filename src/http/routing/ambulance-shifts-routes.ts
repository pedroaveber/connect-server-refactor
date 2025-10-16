import { app } from '@/app'
import { createAmbulanceShift } from '../routes/ambulance-shifts/create-ambulance-shift'

export default function ambulanceShiftsRoutes() {
   app.register(createAmbulanceShift)
}
