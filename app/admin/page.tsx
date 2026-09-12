import { isAdminAuthenticated } from '../../server/admin-session.ts'
import AdminConsole from './admin-console.tsx'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // the layout renders the login form instead of this page, but it does not re-render on a
  // client-side navigation, so the page checks for itself rather than inheriting the answer
  if (!(await isAdminAuthenticated())) {
    return null
  }

  return <AdminConsole />
}
