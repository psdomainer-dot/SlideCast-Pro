-- =============================================
-- SlideCast Pro - Complete Database Schema
-- Version: 2.1.0
-- Procedural MySQLi Compatible
-- Installable & Upgradeable
-- =============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Create Database
CREATE DATABASE IF NOT EXISTS `slidecast_pro` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `slidecast_pro`;

-- =============================================
-- USERS TABLE
-- Stores all user accounts with roles and credits
-- =============================================
CREATE TABLE `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('lecturer','student','trainer','creator','admin') NOT NULL DEFAULT 'student',
    `credits` INT UNSIGNED NOT NULL DEFAULT 5,
    `plan` ENUM('free','professional','enterprise') NOT NULL DEFAULT 'free',
    `plan_expires` DATETIME DEFAULT NULL,
    `avatar` VARCHAR(255) DEFAULT NULL,
    `api_key` VARCHAR(64) DEFAULT NULL,
    `status` ENUM('active','suspended','pending') NOT NULL DEFAULT 'active',
    `email_verified` TINYINT(1) NOT NULL DEFAULT 0,
    `last_login` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_email` (`email`),
    UNIQUE KEY `idx_api_key` (`api_key`),
    KEY `idx_status` (`status`),
    KEY `idx_plan` (`plan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CONVERSIONS TABLE
-- Tracks all PPTX to MP4 conversion jobs
-- =============================================
CREATE TABLE `conversions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `job_id` VARCHAR(50) NOT NULL,
    `filename` VARCHAR(500) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `file_size` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `slide_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `duration` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Duration in seconds',
    `status` ENUM('queued','processing','completed','failed','cancelled') NOT NULL DEFAULT 'queued',
    `progress` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `error_message` TEXT DEFAULT NULL,
    `narration_detected` TINYINT(1) NOT NULL DEFAULT 0,
    `narration_sync` TINYINT(1) NOT NULL DEFAULT 0,
    `priority` TINYINT UNSIGNED NOT NULL DEFAULT 5,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `started_at` DATETIME DEFAULT NULL,
    `completed_at` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_job_id` (`job_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created` (`created_at`),
    CONSTRAINT `fk_conversions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- OUTPUT FILES TABLE
-- Stores rendered MP4 files for each resolution
-- =============================================
CREATE TABLE `output_files` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `conversion_id` INT UNSIGNED NOT NULL,
    `resolution` ENUM('480p','720p','1080p') NOT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `file_size` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `duration` INT UNSIGNED NOT NULL DEFAULT 0,
    `video_codec` VARCHAR(20) NOT NULL DEFAULT 'h264',
    `audio_codec` VARCHAR(20) NOT NULL DEFAULT 'aac',
    `frame_rate` INT UNSIGNED NOT NULL DEFAULT 30,
    `download_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_conversion_id` (`conversion_id`),
    KEY `idx_resolution` (`resolution`),
    CONSTRAINT `fk_output_conversion` FOREIGN KEY (`conversion_id`) REFERENCES `conversions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CREDIT TRANSACTIONS TABLE
-- Tracks all credit movements (purchases, conversions, refunds)
-- =============================================
CREATE TABLE `credit_transactions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `type` ENUM('purchase','conversion','refund','bonus','subscription','admin_adjust') NOT NULL,
    `amount` INT NOT NULL COMMENT 'Positive for credit, negative for debit',
    `balance_after` INT UNSIGNED NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `reference_id` VARCHAR(100) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_type` (`type`),
    KEY `idx_created` (`created_at`),
    CONSTRAINT `fk_credits_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SUBSCRIPTIONS TABLE
-- Manages user subscription plans
-- =============================================
CREATE TABLE `subscriptions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `plan` ENUM('professional','enterprise') NOT NULL,
    `status` ENUM('active','cancelled','expired','past_due') NOT NULL DEFAULT 'active',
    `monthly_credits` INT UNSIGNED NOT NULL,
    `price_monthly` DECIMAL(10,2) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `auto_renew` TINYINT(1) NOT NULL DEFAULT 1,
    `payment_method` VARCHAR(50) DEFAULT NULL,
    `stripe_subscription_id` VARCHAR(100) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SYSTEM SETTINGS TABLE
-- Stores all configurable application settings
-- =============================================
CREATE TABLE `system_settings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `setting_key` VARCHAR(100) NOT NULL,
    `setting_value` TEXT DEFAULT NULL,
    `setting_group` VARCHAR(50) NOT NULL DEFAULT 'general',
    `description` VARCHAR(255) DEFAULT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_key` (`setting_key`),
    KEY `idx_group` (`setting_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- DATABASE MIGRATIONS TABLE
-- Tracks applied migrations for upgrade system
-- =============================================
CREATE TABLE `db_migrations` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `version` VARCHAR(20) NOT NULL,
    `migration_file` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_version` (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ACTIVITY LOG TABLE
-- Records user actions for auditing
-- =============================================
CREATE TABLE `activity_log` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED DEFAULT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50) DEFAULT NULL,
    `entity_id` INT UNSIGNED DEFAULT NULL,
    `details` JSON DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_action` (`action`),
    KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- DEFAULT SETTINGS DATA
-- =============================================
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_group`, `description`) VALUES
('app_name', 'SlideCast Pro', 'general', 'Application name'),
('app_version', '2.1.0', 'system', 'Current application version'),
('max_upload_size', '524288000', 'upload', 'Maximum upload file size in bytes (500MB)'),
('allowed_extensions', 'pptx', 'upload', 'Allowed file extensions'),
('credits_480p', '1', 'credits', 'Credits required for 480p output'),
('credits_720p', '2', 'credits', 'Credits required for 720p output'),
('credits_1080p', '3', 'credits', 'Credits required for 1080p output'),
('free_monthly_credits', '5', 'credits', 'Monthly credits for free plan'),
('pro_monthly_credits', '50', 'credits', 'Monthly credits for professional plan'),
('enterprise_monthly_credits', '200', 'credits', 'Monthly credits for enterprise plan'),
('max_queue_size', '50', 'system', 'Maximum concurrent conversions in queue'),
('maintenance_mode', '0', 'system', 'Enable maintenance mode (0=off, 1=on)'),
('registration_enabled', '1', 'auth', 'Allow new user registration'),
('email_verification_required', '1', 'auth', 'Require email verification for new accounts'),
('default_resolution', '720p', 'conversion', 'Default output resolution'),
('auto_delete_days', '30', 'storage', 'Auto-delete completed files after N days'),
('ffmpeg_path', '/usr/bin/ffmpeg', 'system', 'Path to FFmpeg binary'),
('ffprobe_path', '/usr/bin/ffprobe', 'system', 'Path to FFprobe binary');

-- Record initial migration
INSERT INTO `db_migrations` (`version`, `migration_file`, `description`) VALUES
('2.1.0', 'schema_v2_1_0.sql', 'Initial complete schema installation v2.1.0');

COMMIT;
