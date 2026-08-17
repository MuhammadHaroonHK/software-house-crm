-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "clientId" UUID;

-- CreateIndex
CREATE INDEX "User_clientId_idx" ON "public"."User"("clientId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
