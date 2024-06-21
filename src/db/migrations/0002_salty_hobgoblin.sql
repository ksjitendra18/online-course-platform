DROP INDEX IF EXISTS `course_enrollment_user_id_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `course_enrollment_user_course_id_idx` ON `course_enrollment` (`course_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `course_enrollment_course_id_idx` ON `course_enrollment` (`course_id`);--> statement-breakpoint
CREATE INDEX `course_enrollment_user_id_idx` ON `course_enrollment` (`user_id`);