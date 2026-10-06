CREATE TABLE `attendee` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`age` integer,
	`date_of_birth` text,
	`gender` text,
	`allergies` text,
	`medical_conditions` text,
	`medications` text,
	`medication_instructions` text,
	`dietary_requirements` text,
	`special_needs` text,
	`emergency_name` text,
	`emergency_phone` text,
	`emergency_relationship` text,
	`doctor_name` text,
	`doctor_phone` text,
	`t_shirt_size` text,
	`pickup_authorized` text,
	`notes` text,
	`photo_permission` integer DEFAULT false NOT NULL,
	`media_permission` integer DEFAULT false NOT NULL,
	`field_trip_permission` integer DEFAULT false NOT NULL,
	`water_permission` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attendee_booking_idx` ON `attendee` (`booking_id`);--> statement-breakpoint
CREATE TABLE `booking` (
	`id` text PRIMARY KEY NOT NULL,
	`camp_id` text NOT NULL,
	`user_id` text,
	`contact_name` text NOT NULL,
	`contact_email` text NOT NULL,
	`contact_phone` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`currency` text NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`discount_cents` integer DEFAULT 0 NOT NULL,
	`total_cents` integer NOT NULL,
	`discount_code` text,
	`charge_type` text DEFAULT 'platform' NOT NULL,
	`application_fee_cents` integer DEFAULT 0 NOT NULL,
	`stripe_session_id` text,
	`stripe_payment_intent_id` text,
	`paid_at` integer,
	`details_completed_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`camp_id`) REFERENCES `camp`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `booking_stripe_session_id_unique` ON `booking` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `booking_user_idx` ON `booking` (`user_id`);--> statement-breakpoint
CREATE INDEX `booking_camp_idx` ON `booking` (`camp_id`,`status`);--> statement-breakpoint
CREATE TABLE `commission` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`organisation_id` text NOT NULL,
	`rate` real NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text NOT NULL,
	`settlement` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisation`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commission_booking_id_unique` ON `commission` (`booking_id`);--> statement-breakpoint
CREATE TABLE `discount_code` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`kind` text NOT NULL,
	`value` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`valid_from` text,
	`valid_until` text,
	`max_uses` integer,
	`uses` integer DEFAULT 0 NOT NULL,
	`camp_ids` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `discount_code_code_unique` ON `discount_code` (`code`);