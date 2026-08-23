CREATE TABLE `attendance_justifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attendanceRecordId` int,
	`recordReference` varchar(80) NOT NULL,
	`commissionId` int NOT NULL,
	`studentName` varchar(160) NOT NULL,
	`subject` varchar(160) NOT NULL,
	`classroom` varchar(120),
	`absenceDateLabel` varchar(80) NOT NULL,
	`reason` varchar(120) NOT NULL,
	`comment` text,
	`attachmentName` varchar(255),
	`attachmentKey` varchar(500),
	`attachmentUrl` varchar(800),
	`attachmentMimeType` varchar(160),
	`attachmentSizeBytes` int,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewerRole` enum('docente','administrativo'),
	`reviewerName` varchar(160),
	`reviewComment` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_justifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_justifications_student_reference_unique` UNIQUE(`studentName`,`recordReference`)
);
--> statement-breakpoint
ALTER TABLE `attendance_justifications` ADD CONSTRAINT `att_jus_record_fk` FOREIGN KEY (`attendanceRecordId`) REFERENCES `attendance_records`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance_justifications` ADD CONSTRAINT `att_jus_commission_fk` FOREIGN KEY (`commissionId`) REFERENCES `attendance_commissions`(`id`) ON DELETE no action ON UPDATE no action;
