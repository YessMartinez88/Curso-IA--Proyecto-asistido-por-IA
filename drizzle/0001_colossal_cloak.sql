CREATE TABLE `attendance_commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(48) NOT NULL,
	`subject` varchar(160) NOT NULL,
	`classroom` varchar(120) NOT NULL,
	`teacherName` varchar(160) NOT NULL,
	`scheduleLabel` varchar(120) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_commissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_commissions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `attendance_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commissionId` int NOT NULL,
	`studentName` varchar(160) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_enrollments_commission_student_unique` UNIQUE(`commissionId`,`studentName`)
);
--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`commissionId` int NOT NULL,
	`studentName` varchar(160) NOT NULL,
	`status` enum('present','late') NOT NULL DEFAULT 'present',
	`source` enum('qr','manual') NOT NULL DEFAULT 'qr',
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_records_session_student_unique` UNIQUE(`sessionId`,`studentName`)
);
--> statement-breakpoint
CREATE TABLE `attendance_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commissionId` int NOT NULL,
	`status` enum('open','closed') NOT NULL DEFAULT 'open',
	`qrHash` varchar(64) NOT NULL,
	`qrExpiresAt` timestamp NOT NULL,
	`openedAt` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	CONSTRAINT `attendance_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_sessions_qrHash_unique` UNIQUE(`qrHash`)
);
--> statement-breakpoint
ALTER TABLE `attendance_enrollments` ADD CONSTRAINT `attendance_enrollments_commissionId_attendance_commissions_id_fk` FOREIGN KEY (`commissionId`) REFERENCES `attendance_commissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_sessionId_attendance_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `attendance_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_commissionId_attendance_commissions_id_fk` FOREIGN KEY (`commissionId`) REFERENCES `attendance_commissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance_sessions` ADD CONSTRAINT `attendance_sessions_commissionId_attendance_commissions_id_fk` FOREIGN KEY (`commissionId`) REFERENCES `attendance_commissions`(`id`) ON DELETE no action ON UPDATE no action;