-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('LOST', 'FOUND');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'MATCH_PENDING', 'RETURNED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ELECTRONICS', 'BAGS', 'DOCUMENTS', 'KEYS', 'WALLET', 'CLOTHING', 'BOTTLE', 'BOOKS', 'OTHER');

-- CreateEnum
CREATE TYPE "Subcategory" AS ENUM ('PHONE', 'EARBUDS_HEADPHONES', 'LAPTOP_TABLET', 'CHARGER_CABLE', 'OTHER_ELECTRONICS', 'BACKPACK', 'HANDBAG', 'LAPTOP_BAG', 'OTHER_BAG', 'STUDENT_ID', 'NATIONAL_ID', 'OTHER_DOCUMENT', 'KEYS', 'WALLET_PURSE', 'JACKET_HOODIE', 'SCARF_HAT', 'OTHER_CLOTHING', 'BOTTLE_FLASK', 'BOOK_NOTEBOOK', 'OTHER');

-- CreateEnum
CREATE TYPE "ColorFamily" AS ENUM ('BLACK_DARK', 'WHITE_LIGHT', 'GREY_SILVER', 'BLUE', 'RED_PINK', 'GREEN', 'YELLOW_ORANGE', 'BROWN_BEIGE', 'MULTI', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('CONFIRMED', 'REJECTED');

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "type" "ReportType" NOT NULL,
    "category" "Category" NOT NULL,
    "subcategory" "Subcategory" NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "colorFamily" "ColorFamily" NOT NULL DEFAULT 'UNKNOWN',
    "brand" VARCHAR(50),
    "locations" TEXT[],
    "eventStart" TIMESTAMPTZ(3) NOT NULL,
    "eventEnd" TIMESTAMPTZ(3) NOT NULL,
    "privateDetail" VARCHAR(300),
    "contactName" VARCHAR(80) NOT NULL,
    "contactEmailOrPhone" VARCHAR(120) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchDecision" (
    "id" UUID NOT NULL,
    "lostId" UUID NOT NULL,
    "foundId" UUID NOT NULL,
    "decision" "Decision" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "note" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_type_status_subcategory_eventStart_idx" ON "Report"("type", "status", "subcategory", "eventStart");

-- CreateIndex
CREATE INDEX "Report_contactEmailOrPhone_idx" ON "Report"("contactEmailOrPhone");

-- CreateIndex
CREATE UNIQUE INDEX "MatchDecision_lostId_foundId_key" ON "MatchDecision"("lostId", "foundId");

-- AddForeignKey
ALTER TABLE "MatchDecision" ADD CONSTRAINT "MatchDecision_lostId_fkey" FOREIGN KEY ("lostId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchDecision" ADD CONSTRAINT "MatchDecision_foundId_fkey" FOREIGN KEY ("foundId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A LOST report's window must not end before it starts; for FOUND reports start = end.
ALTER TABLE "Report" ADD CONSTRAINT "Report_event_window_check" CHECK ("eventEnd" >= "eventStart");
-- A report must name at least one location (possibly 'NOT_SURE').
ALTER TABLE "Report" ADD CONSTRAINT "Report_locations_check" CHECK (cardinality("locations") >= 1);
