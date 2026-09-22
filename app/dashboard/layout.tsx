import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { 
  BuildingOffice2Icon, 
  UserGroupIcon, 
  DocumentCheckIcon, 
  WrenchScrewdriverIcon, 
  ClipboardDocumentListIcon 
} from "@heroicons/react/24/outline";

const navigation = [
    { name: "Verification Queue", href:"/dashboard/verification", icon: DocumentCheckIcon },
    { name: "Properties", href: "/dashboard/properties", icon: BuildingOffice2Icon},
    { name: "Vendors", href: "/dashboard/vendors", icon: UserGroupIcon},
    { name: "Work Orders", href: "/dashboard/work-orders", icon: WrenchScrewdriverIcon},
    { name: "Audit Logs", href: "/dashboard/audit-logs", icon: ClipboardDocumentListIcon},
];

export default function DashboardLayout( {children} : { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
                <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-slate-100">
                    <BuildingOffice2Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      <span>PropComply</span>
                    </Link>
                </div>

                <nav className="p-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2 text-smm font-medium text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-100 transition-colors"
                        >
                            <item.icon className="w-5 h-5 text-slate-400" />
                            {item.name}
                        </Link>  
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-end">
                    <UserButton />
                </header>

                <main className="flex-1 p-6 md:px-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}