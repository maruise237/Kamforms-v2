-- Performance indexes for common query patterns
-- Form queries by userId (dashboard list, ownership checks)
CREATE INDEX IF NOT EXISTS "Form_userId_idx" ON "Form"("userId");
CREATE INDEX IF NOT EXISTS "Form_userId_createdAt_idx" ON "Form"("userId", "createdAt" DESC);

-- Submission queries by formId (list, count, export, analytics)
CREATE INDEX IF NOT EXISTS "Submission_formId_idx" ON "Submission"("formId");
CREATE INDEX IF NOT EXISTS "Submission_formId_createdAt_idx" ON "Submission"("formId", "createdAt" DESC);
