CREATE TABLE `attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`url` text NOT NULL,
	`course_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text,
	`module_id` text,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`module_id`) REFERENCES `module`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `device` (
	`id` text PRIMARY KEY NOT NULL,
	`device_fingerprint` text NOT NULL,
	`os` text NOT NULL,
	`browser` text NOT NULL,
	`user_ip` text NOT NULL,
	`last_active` integer NOT NULL,
	`user_id` text NOT NULL,
	`logged_in` integer NOT NULL,
	`session_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`active` integer DEFAULT true,
	`expires_at` blob NOT NULL,
	`user_ip` text NOT NULL,
	`device_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`user_name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`password` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chapter` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`video_url` text,
	`position` integer NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`is_free` integer DEFAULT false NOT NULL,
	`module_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text,
	FOREIGN KEY (`module_id`) REFERENCES `module`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `course_category` (
	`course_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`category_id`, `course_id`),
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `course_member` (
	`course_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`course_id`, `user_id`),
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `module` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`module_slug` text NOT NULL,
	`course_id` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `course` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_url` text,
	`price` integer,
	`is_published` integer DEFAULT false NOT NULL,
	`is_free` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`ip` text NOT NULL,
	`device_fingerprint` text,
	`info` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `order_data` (
	`id` text,
	`course_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `purchase` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`razorpay_order_id` text NOT NULL,
	`razorpay_payment_id` text NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `video_data` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`playback_id` text,
	`chapter_id` text NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organization_member` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `attachment_course_id_idx` ON `attachment` (`course_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `device_sess_id_idx` ON `device` (`session_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_slug_unique` ON `organization` (`slug`);--> statement-breakpoint
CREATE INDEX `user_id_sess_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_user_name_unique` ON `user` (`user_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_slug_unique` ON `category` (`slug`);--> statement-breakpoint
CREATE INDEX `chapter_module_id_idx` ON `chapter` (`module_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `module_module_slug_unique` ON `module` (`module_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `course_module_slug` ON `module` (`course_id`,`module_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `course_slug_unique` ON `course` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `order_user_id_idx` ON `order_data` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `order_user_course_id_idx` ON `order_data` (`course_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `purchase_course_id_idx` ON `purchase` (`course_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `purchase_user_course_id_idx` ON `purchase` (`user_id`,`course_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `video_chapter_id_idx` ON `video_data` (`chapter_id`);