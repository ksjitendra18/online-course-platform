CREATE INDEX `video_course_id_idx` ON `video_data` (`course_id`);--> statement-breakpoint
CREATE INDEX `video_chapter_id_idx` ON `video_data` (`chapter_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `video_course_chap_idx` ON `video_data` (`course_id`,`chapter_id`);