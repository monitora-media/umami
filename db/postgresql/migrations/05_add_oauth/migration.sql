-- CreateTable
CREATE TABLE "oauth_provider" (
    "oauth_provider_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "client_id" VARCHAR(255) NOT NULL,
    "client_secret" VARCHAR(255) NOT NULL,
    "authorization_endpoint" VARCHAR(255) NOT NULL,
    "token_endpoint" VARCHAR(255) NOT NULL,
    "userinfo_endpoint" VARCHAR(255) NOT NULL,
    "id_claim" VARCHAR(50) NOT NULL,
    "username_claim" VARCHAR(50) NOT NULL,
    "display_name_claim" VARCHAR(50) NOT NULL,
    "logo_url_claim" VARCHAR(50) NOT NULL,
    "team_names_claim" VARCHAR(50) NOT NULL,
    "scope" VARCHAR(255) NOT NULL,
    "enable_csrf_protection" BOOLEAN NOT NULL DEFAULT true,
    "pass_access_token_via_get_parameter" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "oauth_provider_pkey" PRIMARY KEY ("oauth_provider_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_provider_oauth_provider_id_key" ON "oauth_provider"("oauth_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_provider_name_key" ON "oauth_provider"("name");
