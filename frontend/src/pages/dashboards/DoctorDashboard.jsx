import { Layout } from '../../components/Layout.jsx'
import { Card } from '../../components/Card.jsx'

export const DoctorDashboard = () => {
  const nav = [
    {to:'/dashboard/doctor', label:'Overview'},
    {to:'/dashboard/doctor/patients', label:'Patients'},
    {to:'/dashboard/doctor/prescriptions', label:'Prescriptions'},
    {to:'/dashboard/doctor/chat', label:'Chat'}
  ]
  return <Layout items={nav}>
    <div className="grid md:grid-cols-3 gap-6">
      <Card><h3 className="font-semibold mb-2">Pending Reviews</h3><p className="text-sm opacity-70">0 prescriptions</p></Card>
      <Card><h3 className="font-semibold mb-2">Patients</h3><p className="text-sm opacity-70">0 active</p></Card>
      <Card><h3 className="font-semibold mb-2">Messages</h3><p className="text-sm opacity-70">No new</p></Card>
    </div>
  </Layout>
}
