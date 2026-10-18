<?php
/**
 * SlideCast Pro - Configuration Template
 * This file is auto-generated during installation.
 * Copy this to config.php and update values.
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'slidecast_pro');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_PORT', 3306);

// Application Settings
define('APP_NAME', 'SlideCast Pro');
define('APP_VERSION', '2.1.0');
define('APP_URL', 'http://localhost/slidecast-pro');
define('INSTALLED', false); // Set to true after installation

// Paths
define('UPLOAD_PATH', __DIR__ . '/uploads/');
define('OUTPUT_PATH', __DIR__ . '/output/');
define('TEMP_PATH', __DIR__ . '/temp/');
define('LOG_PATH', __DIR__ . '/logs/');

// Upload Limits
define('MAX_UPLOAD_SIZE', 524288000); // 500MB
define('ALLOWED_EXTENSIONS', ['pptx']);

// Credit Costs per Resolution
define('CREDITS_480P', 1);
define('CREDITS_720P', 2);
define('CREDITS_1080P', 3);

// Session Settings
define('SESSION_LIFETIME', 86400); // 24 hours

// FFmpeg Settings
define('FFMPEG_PATH', '/usr/bin/ffmpeg');
define('FFPROBE_PATH', '/usr/bin/ffprobe');

// Error Reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Timezone
date_default_timezone_set('UTC');

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
