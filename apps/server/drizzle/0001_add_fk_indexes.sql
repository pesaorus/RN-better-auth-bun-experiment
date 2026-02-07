CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);
--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_provider_idx` ON `account` (`provider_id`, `account_id`);
