ALTER TABLE `attendance_commissions` MODIFY COLUMN `subject` varchar(160);--> statement-breakpoint
ALTER TABLE `attendance_commissions` MODIFY COLUMN `classroom` varchar(120);--> statement-breakpoint
ALTER TABLE `attendance_commissions` MODIFY COLUMN `teacherName` varchar(160);--> statement-breakpoint
ALTER TABLE `attendance_commissions` MODIFY COLUMN `scheduleLabel` varchar(120);--> statement-breakpoint
ALTER TABLE `attendance_commissions` ADD `periodLabel` varchar(120);--> statement-breakpoint
ALTER TABLE `attendance_commissions` ADD `status` enum('draft','active') DEFAULT 'active' NOT NULL;