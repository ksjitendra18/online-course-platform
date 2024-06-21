DROP INDEX IF EXISTS `course_enrollment_user_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `course_enrollment_course_id_idx`;--> statement-breakpoint
ALTER TABLE `category` ADD `is_featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_course_chap_idx` ON `quiz` (`course_id`,`chapter_id`);--> statement-breakpoint
CREATE INDEX `course_enrollment_user_id_idx` ON `course_enrollment` (`user_id`);--> statement-breakpoint
CREATE INDEX `course_enrollment_course_id_idx` ON `course_enrollment` (`course_id`);