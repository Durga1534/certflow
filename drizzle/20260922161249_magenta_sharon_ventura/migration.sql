CREATE TYPE "organization_status" AS ENUM('active', 'suspended', 'canceled');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('admin', 'property_manager', 'auditor');--> statement-breakpoint
CREATE TYPE "vendor_compliance_status" AS ENUM('compliant', 'non_compliant', 'pending_review', 'exempt');--> statement-breakpoint
CREATE TYPE "vendor_status" AS ENUM('active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "document_status" AS ENUM('RECEIVED', 'EXTRACTED', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'SUPERSEDED');--> statement-breakpoint
CREATE TYPE "document_type" AS ENUM('COI', 'WSIB', 'FIRE_INSPECTION', 'ELEVATOR', 'LICENSE', 'OTHER');--> statement-breakpoint
CREATE TYPE "work_order_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');--> statement-breakpoint
CREATE TYPE "work_order_status" AS ENUM('DRAFT', 'PENDING_COMPLIANCE', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(36) PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"status" "organization_status" DEFAULT 'active'::"organization_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"clerk_organization_id" varchar(255) UNIQUE
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" varchar(36) PRIMARY KEY,
	"organization_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state_province" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(2) DEFAULT 'CA',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" varchar(36) PRIMARY KEY,
	"organization_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"unit_number" varchar(50) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY,
	"organization_id" varchar(36) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"role" "user_role" DEFAULT 'property_manager'::"user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" varchar(36) PRIMARY KEY,
	"organization_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"company_number" varchar(100),
	"contact_name" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"status" "vendor_status" DEFAULT 'active'::"vendor_status" NOT NULL,
	"compliance_status" "vendor_compliance_status" DEFAULT 'pending_review'::"vendor_compliance_status" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_documents" (
	"id" varchar(36) PRIMARY KEY,
	"organization_id" varchar(36) NOT NULL,
	"vendor_id" varchar(36) NOT NULL,
	"property_id" varchar(36),
	"document_type" "document_type" NOT NULL,
	"status" "document_status" DEFAULT 'RECEIVED'::"document_status" NOT NULL,
	"file_key" varchar(512) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size_bytes" integer,
	"mime_type" varchar(100),
	"document_number" varchar(100),
	"issue_date" date,
	"expiry_date" date,
	"extracted_data" jsonb,
	"rejection_reason" text,
	"verified_by_user_id" varchar(255),
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" varchar(36) PRIMARY KEY,
	"organization_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"unit_id" varchar(36),
	"vendor_id" varchar(36),
	"work_order_number" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "work_order_status" DEFAULT 'DRAFT'::"work_order_status" NOT NULL,
	"priority" "work_order_priority" DEFAULT 'MEDIUM'::"work_order_priority" NOT NULL,
	"scheduled_start_date" timestamp,
	"compliance_error" boolean DEFAULT false NOT NULL,
	"compliance_override_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "idx_properties_organization_id" ON "properties" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_properties_org_name_active" ON "properties" ("organization_id","name") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_units_organization_id" ON "units" ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_units_property_id" ON "units" ("property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_units_property_number_active" ON "units" ("property_id","unit_number") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_users_organization_id" ON "users" ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "idx_vendors_organization_id" ON "vendors" ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_vendors_org_compliance" ON "vendors" ("organization_id","compliance_status");--> statement-breakpoint
CREATE INDEX "idx_vendors_org_email" ON "vendors" ("organization_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_vendors_org_name_active" ON "vendors" ("organization_id","name") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_vdocs_organization_id" ON "vendor_documents" ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_vdocs_vendor_id" ON "vendor_documents" ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_vdocs_expiry_date" ON "vendor_documents" ("organization_id","expiry_date");--> statement-breakpoint
CREATE INDEX "idx_vdocs_status_queue" ON "vendor_documents" ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_work_orders_organization_id" ON "work_orders" ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_work_orders_property_id" ON "work_orders" ("property_id");--> statement-breakpoint
CREATE INDEX "idx_work_orders_vendor_id" ON "work_orders" ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_work_orders_org_status" ON "work_orders" ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_work_orders_org_number_active" ON "work_orders" ("organization_id","work_order_number") WHERE "deleted_at" IS NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_property_id_properties_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_vendor_id_vendors_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_property_id_properties_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_property_id_properties_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_unit_id_units_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vendor_id_vendors_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL;