ALTER TABLE `discussion-reply` RENAME TO `discussion_reply`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_discussion_reply` (
	`id` text PRIMARY KEY NOT NULL,
	`reply` text,
	`discussion_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`discussion_id`) REFERENCES `discussion`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_discussion_reply`("id", "reply", "discussion_id", "user_id", "created_at", "updated_at") SELECT "id", "reply", "discussion_id", "user_id", "created_at", "updated_at" FROM `discussion_reply`;--> statement-breakpoint
DROP TABLE `discussion_reply`;--> statement-breakpoint
ALTER TABLE `__new_discussion_reply` RENAME TO `discussion_reply`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `dreply_disc_id_idx` ON `discussion_reply` (`discussion_id`);