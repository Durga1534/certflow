import { getTenantDb } from "@/lib/auth/get-tenant-db";
import { VendorTable } from "./vendor-table";

export default async function VendorsPage() {
    const tenantDb = await getTenantDb();
    const vendorsList = await tenantDb.vendors.findMany();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Vendors & Contractors</h1>
                    <p className="text-sm text-slate-500">Monitor contractor insurance compliance and operational statuses.</p>
                </div>
            </div>

            <VendorTable initialVendors={vendorsList} />
        </div>
    );
}