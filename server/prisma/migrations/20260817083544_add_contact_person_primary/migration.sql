-- AlterTable
ALTER TABLE "public"."ContactPerson" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ContactPerson_clientId_isPrimary_idx" ON "public"."ContactPerson"("clientId", "isPrimary");
