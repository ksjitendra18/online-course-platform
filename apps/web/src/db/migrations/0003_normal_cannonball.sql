CREATE TABLE `course_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`modules_count` integer NOT NULL,
	`quizzes_count` integer NOT NULL,
	`videos_count` integer NOT NULL,
	`video_duration` integer NOT NULL,
	`attachment_count` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `course_metdata_course_id_idx` ON `course_metadata` (`course_id`);--> statement-breakpoint
CREATE INDEX `course_enrollment_created_at_idx` ON `course_enrollment` (`created_at`);