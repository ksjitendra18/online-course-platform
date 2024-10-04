CREATE TABLE `article` (
	`id` text PRIMARY KEY NOT NULL,
	`string` text NOT NULL,
	`chapter_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`size` integer,
	`chapter_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `video_attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`size` integer,
	`video_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `video_data`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `admin_auth_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`user_info` text NOT NULL,
	`action` text NOT NULL,
	`browser` text NOT NULL,
	`device` text NOT NULL,
	`os` text NOT NULL,
	`ip` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `login_log` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`user_id` text,
	`strategy` text NOT NULL,
	`browser` text NOT NULL,
	`device` text NOT NULL,
	`os` text NOT NULL,
	`ip` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `oauth_provider` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `password` (
	`user_id` text PRIMARY KEY NOT NULL,
	`password` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `password_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recovery_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`code` text NOT NULL,
	`is_used` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` text DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`user_name` text NOT NULL,
	`email` text NOT NULL,
	`avatar` text,
	`email_verified` integer DEFAULT false NOT NULL,
	`two_factor_enabled` integer DEFAULT false NOT NULL,
	`two_factor_secret` text,
	`is_blocked` integer DEFAULT false NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chapter` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`position` integer NOT NULL,
	`module_position` integer NOT NULL,
	`is_free` integer DEFAULT false NOT NULL,
	`module_id` text NOT NULL,
	`course_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`deleted_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `course_module`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chapter_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text,
	`description` text,
	`chapter_id` text,
	`course_id` text NOT NULL,
	`user_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE set null ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `course_category` (
	`course_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`course_id`, `category_id`),
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `course_member` (
	`course_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`course_id`, `user_id`),
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `course_module` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`module_slug` text NOT NULL,
	`course_id` text NOT NULL,
	`position` integer NOT NULL,
	`status` text NOT NULL,
	`deleted_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `course_module_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text,
	`description` text,
	`module_id` text,
	`course_id` text NOT NULL,
	`user_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `course_module`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE set null ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `course_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`chapter_id` text NOT NULL,
	`course_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
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
	`validity` integer,
	`duration` integer,
	`level` text NOT NULL,
	`is_free` integer NOT NULL,
	`status` text NOT NULL,
	`deleted_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `course_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text,
	`description` text,
	`course_id` text,
	`user_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE set null ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `discount` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`percent` integer NOT NULL,
	`course_id` text,
	`is_global` integer NOT NULL,
	`usage_limit` integer NOT NULL,
	`valid_till` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `discussion` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`description` text,
	`course_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `discussion-reply` (
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
CREATE TABLE `discussion_vote` (
	`discussion_id` text NOT NULL,
	`user_id` text NOT NULL,
	`upvote` integer DEFAULT 0 NOT NULL,
	`downvote` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`discussion_id`, `user_id`),
	FOREIGN KEY (`discussion_id`) REFERENCES `discussion`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `course_enrollment` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `purchase` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`price` integer NOT NULL,
	`discount_used` integer DEFAULT false NOT NULL,
	`discount_percent` integer DEFAULT 0 NOT NULL,
	`discount_code` text,
	`razorpay_order_id` text NOT NULL,
	`razorpay_payment_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `video_data` (
	`id` text PRIMARY KEY NOT NULL,
	`playback_id` text NOT NULL,
	`duration` integer NOT NULL,
	`course_id` text,
	`chapter_id` text NOT NULL,
	`is_flagged` integer DEFAULT false,
	`is_deleted` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organization_member` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`is_blocked` integer DEFAULT false NOT NULL,
	`role` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quiz` (
	`id` text PRIMARY KEY NOT NULL,
	`instructions` text NOT NULL,
	`allow_multiple_attempts` integer DEFAULT false,
	`is_time_limited` integer DEFAULT false,
	`start_date` integer,
	`end_date` integer,
	`duration` integer NOT NULL,
	`chapter_id` text NOT NULL,
	`course_id` text NOT NULL,
	`status` text NOT NULL,
	`deleted_at` integer,
	`created_at` text DEFAULT (unixepoch()) NOT NULL,
	`updated_at` text DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quiz_answer` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`answer_text` text NOT NULL,
	`is_correct` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `quiz_question`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quiz_question` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`question_text` text NOT NULL,
	`type` text,
	FOREIGN KEY (`quiz_id`) REFERENCES `quiz`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quiz_response` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`course_id` text NOT NULL,
	`duration` integer NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quiz`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quiz_user_response` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_response_id` text NOT NULL,
	`question_id` text NOT NULL,
	`answer_id` text NOT NULL,
	FOREIGN KEY (`quiz_response_id`) REFERENCES `quiz_response`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `quiz_question`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`answer_id`) REFERENCES `quiz_answer`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text,
	`rating` integer NOT NULL,
	`is_highlighted` integer DEFAULT false,
	`course_id` text NOT NULL,
	`user_id` text NOT NULL,
	`is_flagged` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chap_id_idx` ON `article` (`chapter_id`);--> statement-breakpoint
CREATE INDEX `attach_chap_id_idx` ON `attachment` (`chapter_id`);--> statement-breakpoint
CREATE INDEX `vidattc_vid_id_idx` ON `video_attachment` (`video_id`);--> statement-breakpoint
CREATE INDEX `oauth_provider_user_id_idx` ON `oauth_provider` (`provider_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_slug_unique` ON `organization` (`slug`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `password_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_id_sess_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_user_name_unique` ON `user` (`user_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_slug_unique` ON `category` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `module_id_slug` ON `chapter` (`module_id`,`slug`);--> statement-breakpoint
CREATE INDEX `chapter_course_idx` ON `chapter` (`course_id`);--> statement-breakpoint
CREATE INDEX `cl_course_idx` ON `chapter_logs` (`course_id`);--> statement-breakpoint
CREATE INDEX `cl_chapter_idx` ON `chapter_logs` (`chapter_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `course_module_slug` ON `course_module` (`course_id`,`module_slug`);--> statement-breakpoint
CREATE INDEX `course_module_course_idx` ON `course_module_logs` (`course_id`);--> statement-breakpoint
CREATE INDEX `course_module_logs_user_idx` ON `course_module_logs` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `course_progress_user_id_idx` ON `course_progress` (`user_id`,`chapter_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `course_slug_unique` ON `course` (`slug`);--> statement-breakpoint
CREATE INDEX `course_logs_cid_idx` ON `course_logs` (`course_id`);--> statement-breakpoint
CREATE INDEX `course_logs_uid_idx` ON `course_logs` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `discount_code_unique` ON `discount` (`code`);--> statement-breakpoint
CREATE INDEX `dis_course_id_idx` ON `discount` (`course_id`);--> statement-breakpoint
CREATE INDEX `disc_course_id_idx` ON `discussion` (`course_id`);--> statement-breakpoint
CREATE INDEX `dreply_disc_id_idx` ON `discussion-reply` (`discussion_id`);--> statement-breakpoint
CREATE INDEX `dv_disc_id_idx` ON `discussion_vote` (`discussion_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `course_enrollment_user_course_id_idx` ON `course_enrollment` (`course_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `course_enrollment_user_id_idx` ON `course_enrollment` (`user_id`);--> statement-breakpoint
CREATE INDEX `course_enrollment_course_id_idx` ON `course_enrollment` (`course_id`);--> statement-breakpoint
CREATE INDEX `purchase_course_id_idx` ON `purchase` (`course_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `purchase_user_course_id_idx` ON `purchase` (`user_id`,`course_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `video_data_chapter_id_unique` ON `video_data` (`chapter_id`);--> statement-breakpoint
CREATE INDEX `video_course_id_idx` ON `video_data` (`course_id`);--> statement-breakpoint
CREATE INDEX `video_chapter_id_idx` ON `video_data` (`chapter_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `video_course_chap_idx` ON `video_data` (`course_id`,`chapter_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_id_user_id_idx` ON `organization_member` (`organization_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `org_mem_user_idx` ON `organization_member` (`user_id`);--> statement-breakpoint
CREATE INDEX `quiz_chap_idx` ON `quiz` (`chapter_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_course_chap_idx` ON `quiz` (`course_id`,`chapter_id`);--> statement-breakpoint
CREATE INDEX `qzans_quesid_idx` ON `quiz_answer` (`question_id`);--> statement-breakpoint
CREATE INDEX `qzques_qid_idx` ON `quiz_question` (`quiz_id`);--> statement-breakpoint
CREATE INDEX `quiz_course_idx` ON `quiz_response` (`course_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_user_id_idx` ON `quiz_response` (`quiz_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `quizres_ques_id_idx` ON `quiz_user_response` (`quiz_response_id`,`question_id`);--> statement-breakpoint
CREATE INDEX `review_course_id_idx` ON `review` (`course_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `rview_user_crs_idx` ON `review` (`course_id`,`user_id`);