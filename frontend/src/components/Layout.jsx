import { Sidebar } from './Sidebar.jsx'
import { Topbar } from './Topbar.jsx'

export const Layout = ({items,children}) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex overflow-x-hidden">
    <Sidebar items={items} />
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar />
      <main className="flex-1 p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 pt-16 md:pt-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  </div>
)
