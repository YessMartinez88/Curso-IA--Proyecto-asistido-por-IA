CREATE TABLE `academic_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commissionId` int NOT NULL,
	`type` enum('evaluation','practical_work') NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`dueAt` timestamp,
	`maxScore` int NOT NULL DEFAULT 10,
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academic_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `academic_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityId` int NOT NULL,
	`studentName` varchar(160) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(800) NOT NULL,
	`mimeType` varchar(160) NOT NULL,
	`sizeBytes` int NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`score` int,
	`feedback` text,
	`gradedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academic_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `academic_submissions_activity_student_unique` UNIQUE(`activityId`,`studentName`)
);
--> statement-breakpoint
ALTER TABLE `academic_activities` ADD CONSTRAINT `academic_activities_commissionId_attendance_commissions_id_fk` FOREIGN KEY (`commissionId`) REFERENCES `attendance_commissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `academic_submissions` ADD CONSTRAINT `academic_submissions_activityId_academic_activities_id_fk` FOREIGN KEY (`activityId`) REFERENCES `academic_activities`(`id`) ON DELETE no action ON UPDATE no action;