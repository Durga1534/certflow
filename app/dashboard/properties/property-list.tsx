"use client";

import { useState, useTransition } from "react";
import { createPropertyAction } from "@/actions/properties";

interface Property {
    id: string;
    name: string;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    stateProvince: string | null;
    postalCode: string | null;
    country: string | null;
}

export function PropertyList({ initialProperties }: { initialProperties: Property[] }) {
    const [properties, setProperties] = useState<Property[]>(initialProperties);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = {
            name: formData.get("name") as string,
            addressLine1: (formData.get("addressLine1") as string) || "",
            addressLine2: (formData.get("addressLine2") as string) || "",
            city: (formData.get("city") as string) || "",
            stateProvince: (formData.get("stateProvince") as string) || "",
            postalCode: (formData.get("postalCode") as string) || "",
            country: (formData.get("country") as string) || "CA",
        };

        startTransition(async () => {
            const newProperty = await createPropertyAction(payload);
            if (newProperty) {
                setProperties((prev) => [{ ...newProperty, country: newProperty.country ?? "CA" }, ...prev]);
                setIsOpen(false);
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                  onClick={() => setIsOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                > 
                  + Add Property
                </button>  
            </div>

            {/* Property Card */}
            <div className="grid grid-cols-1 md-grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((prop) => (
                    <div key={prop.id} className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{prop.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {[prop.addressLine1, prop.city, prop.stateProvince].filter(Boolean).join(",") || "No address specified"}
                        </p>
                      </div>  
                ))}
            </div>

            {/* Create Property Model */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center p-4 z-50"> 
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-lg shadow-xl">
                        <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Create New Property</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Property Name *</label>
                                <input name="name" required className="w-full border rounded-md p-2 text-sm bg-slate-50 dark:bg-slate-800" placeholder="e.g. Maple Ridge Apartments" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Address Line 1</label>
                                <input name="addressLine1" className="w-full border rounded-md p-2 text-sm bg-slate-50 dark:bg-slate-800" placeholder="123 Main St" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                                    <input name="city" className="w-full border rounded-md p-2 text-sm bg-slate-50 dark:bg-slate-800" placeholder="Toronto" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">State/Province</label>
                                    <input name="stateProvince" className="w-full border rounded-md text-sm bg-slate-50 dark:bg-slate-800" placeholder="ON" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
                                <button type="submit" disabled={isPending} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                                    {isPending ? "Creating..." : "Save Property"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}