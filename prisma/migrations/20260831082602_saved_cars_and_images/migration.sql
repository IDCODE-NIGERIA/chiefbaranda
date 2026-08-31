-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_cars" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "listingKind" TEXT NOT NULL DEFAULT 'buy',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_cars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_cars_userId_createdAt_idx" ON "saved_cars"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "saved_cars_userId_listingId_key" ON "saved_cars"("userId", "listingId");

-- AddForeignKey
ALTER TABLE "saved_cars" ADD CONSTRAINT "saved_cars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
