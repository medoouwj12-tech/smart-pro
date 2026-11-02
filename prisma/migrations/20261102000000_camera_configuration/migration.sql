ALTER TABLE "Camera"
  ADD COLUMN "manufacturer" TEXT,
  ADD COLUMN "model" TEXT,
  ADD COLUMN "port" INTEGER,
  ADD COLUMN "username" TEXT,
  ADD COLUMN "streamPath" TEXT,
  ADD COLUMN "passwordEncrypted" TEXT;

ALTER TABLE "AIDetectionRule"
  ADD COLUMN "detectionType" TEXT NOT NULL DEFAULT 'CUSTOM';
