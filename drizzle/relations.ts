import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	properties: {
		organization: r.one.organizations({
			from: r.properties.organizationId,
			to: r.organizations.id,
			alias: "properties_organizationId_organizations_id"
		}),
		organizations: r.many.organizations({
			alias: "organizations_id_properties_id_via_units"
		}),
		vendorDocuments: r.many.vendorDocuments(),
		workOrders: r.many.workOrders(),
	},
	organizations: {
		propertiesOrganizationId: r.many.properties({
			alias: "properties_organizationId_organizations_id"
		}),
		propertiesViaUnits: r.many.properties({
			from: r.organizations.id.through(r.units.organizationId),
			to: r.properties.id.through(r.units.propertyId),
			alias: "organizations_id_properties_id_via_units"
		}),
		vendorDocuments: r.many.vendorDocuments(),
		vendors: r.many.vendors(),
		workOrders: r.many.workOrders(),
	},
	vendorDocuments: {
		organization: r.one.organizations({
			from: r.vendorDocuments.organizationId,
			to: r.organizations.id
		}),
		property: r.one.properties({
			from: r.vendorDocuments.propertyId,
			to: r.properties.id
		}),
		vendor: r.one.vendors({
			from: r.vendorDocuments.vendorId,
			to: r.vendors.id
		}),
	},
	vendors: {
		vendorDocuments: r.many.vendorDocuments(),
		organization: r.one.organizations({
			from: r.vendors.organizationId,
			to: r.organizations.id
		}),
		workOrders: r.many.workOrders(),
	},
	workOrders: {
		organization: r.one.organizations({
			from: r.workOrders.organizationId,
			to: r.organizations.id
		}),
		property: r.one.properties({
			from: r.workOrders.propertyId,
			to: r.properties.id
		}),
		unit: r.one.units({
			from: r.workOrders.unitId,
			to: r.units.id
		}),
		vendor: r.one.vendors({
			from: r.workOrders.vendorId,
			to: r.vendors.id
		}),
	},
	units: {
		workOrders: r.many.workOrders(),
	},
}))