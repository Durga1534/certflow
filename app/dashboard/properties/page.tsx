import { getTenantDb } from "@/lib/auth/get-tenant-db";
import { PropertyList } from "./property-list";

export default async function PropertiesPage() {
    const tenantDb = await getTenantDb();
    const propertiesList = await tenantDb.properties.findMany();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Properties & Units</h1>
                    <p className="text-sm text-slate-500">Manage real estate assets, residential units, and commercial spaces.</p>
                </div>
            </div>

            <PropertyList initialProperties={propertiesList} />
        </div>
    );
}