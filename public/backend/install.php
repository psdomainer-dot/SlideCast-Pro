<?php
/**
 * SlideCast Pro - Installation Script
 * Procedural PHP with MySQLi
 * Version: 2.1.0
 * 
 * INSTALLABLE & UPGRADEABLE PLATFORM
 * This installer sets up the database, creates directories,
 * and configures the application for first use.
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ============================================
// CONFIGURATION
// ============================================
define('APP_NAME', 'SlideCast Pro');
define('APP_VERSION', '2.1.0');
define('MIN_PHP_VERSION', '8.0.0');
define('MIN_MYSQL_VERSION', '5.7.0');

$step = isset($_GET['step']) ? intval($_GET['step']) : 1;
$errors = [];
$success = [];

// ============================================
// HELPER FUNCTIONS
// ============================================
function return_bytes($val) {
    $val = trim($val);
    $last = strtolower($val[strlen($val)-1]);
    $val = (int)$val;
    switch($last) {
        case 'g': $val *= 1024;
        case 'm': $val *= 1024;
        case 'k': $val *= 1024;
    }
    return $val;
}

function check_writable($path) {
    if (!is_dir($path)) {
        return mkdir($path, 0755, true);
    }
    return is_writable($path);
}

// ============================================
// SYSTEM REQUIREMENTS CHECK
// ============================================
function check_requirements() {
    $requirements = [];
    
    // PHP Version
    $requirements['php_version'] = [
        'name' => 'PHP Version >= ' . MIN_PHP_VERSION,
        'status' => version_compare(PHP_VERSION, MIN_PHP_VERSION, '>='),
        'current' => PHP_VERSION,
        'critical' => true
    ];
    
    // MySQLi Extension
    $requirements['mysqli'] = [
        'name' => 'MySQLi Extension',
        'status' => extension_loaded('mysqli'),
        'current' => extension_loaded('mysqli') ? 'Installed' : 'Missing',
        'critical' => true
    ];
    
    // ZipArchive
    $requirements['zip'] = [
        'name' => 'ZipArchive Extension',
        'status' => class_exists('ZipArchive'),
        'current' => class_exists('ZipArchive') ? 'Available' : 'Missing',
        'critical' => true
    ];
    
    // JSON Extension
    $requirements['json'] = [
        'name' => 'JSON Extension',
        'status' => extension_loaded('json'),
        'current' => extension_loaded('json') ? 'Installed' : 'Missing',
        'critical' => true
    ];
    
    // FFmpeg
    $ffmpeg_output = [];
    $ffmpeg_return = -1;
    @exec('ffmpeg -version 2>&1', $ffmpeg_output, $ffmpeg_return);
    $ffmpeg_version = '';
    if ($ffmpeg_return === 0 && !empty($ffmpeg_output)) {
        preg_match('/ffmpeg version (\S+)/', $ffmpeg_output[0], $matches);
        $ffmpeg_version = $matches[1] ?? 'Unknown';
    }
    $requirements['ffmpeg'] = [
        'name' => 'FFmpeg (Video Processing)',
        'status' => $ffmpeg_return === 0,
        'current' => $ffmpeg_return === 0 ? $ffmpeg_version : 'Not Found',
        'critical' => true
    ];
    
    // LibreOffice
    $lo_output = [];
    $lo_return = -1;
    @exec('libreoffice --version 2>&1', $lo_output, $lo_return);
    $lo_version = '';
    if ($lo_return === 0 && !empty($lo_output)) {
        $lo_version = trim($lo_output[0]);
    }
    $requirements['libreoffice'] = [
        'name' => 'LibreOffice (Slide Extraction)',
        'status' => $lo_return === 0,
        'current' => $lo_return === 0 ? $lo_version : 'Not Found',
        'critical' => false
    ];
    
    // Upload Size
    $upload_max = ini_get('upload_max_filesize');
    $post_max = ini_get('post_max_size');
    $requirements['upload_size'] = [
        'name' => 'Upload Max Filesize >= 500M',
        'status' => return_bytes($upload_max) >= 524288000,
        'current' => $upload_max . ' (post_max: ' . $post_max . ')',
        'critical' => false
    ];
    
    // Max Execution Time
    $max_time = ini_get('max_execution_time');
    $requirements['exec_time'] = [
        'name' => 'Max Execution Time >= 300s',
        'status' => $max_time == 0 || intval($max_time) >= 300,
        'current' => $max_time == 0 ? 'Unlimited' : $max_time . 's',
        'critical' => false
    ];
    
    // Memory Limit
    $memory = ini_get('memory_limit');
    $requirements['memory'] = [
        'name' => 'Memory Limit >= 512M',
        'status' => $memory === '-1' || return_bytes($memory) >= 536870912,
        'current' => $memory,
        'critical' => false
    ];
    
    // Writable directories
    $dirs = ['uploads', 'output', 'temp', 'logs', 'backups'];
    foreach ($dirs as $dir) {
        $path = __DIR__ . '/' . $dir;
        $writable = check_writable($path);
        $requirements[$dir . '_writable'] = [
            'name' => ucfirst($dir) . ' Directory Writable',
            'status' => $writable,
            'current' => $writable ? 'Writable' : 'Not Writable',
            'critical' => true
        ];
    }
    
    return $requirements;
}

// ============================================
// DATABASE SETUP
// ============================================
function setup_database($conn) {
    $queries = [
        // Users table
        "CREATE TABLE IF NOT EXISTS `users` (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Conversions table
        "CREATE TABLE IF NOT EXISTS `conversions` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `user_id` INT UNSIGNED NOT NULL,
            `job_id` VARCHAR(50) NOT NULL,
            `filename` VARCHAR(500) NOT NULL,
            `original_name` VARCHAR(255) NOT NULL,
            `file_size` BIGINT UNSIGNED NOT NULL DEFAULT 0,
            `slide_count` INT UNSIGNED NOT NULL DEFAULT 0,
            `duration` INT UNSIGNED NOT NULL DEFAULT 0,
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Output files table
        "CREATE TABLE IF NOT EXISTS `output_files` (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Credit transactions
        "CREATE TABLE IF NOT EXISTS `credit_transactions` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `user_id` INT UNSIGNED NOT NULL,
            `type` ENUM('purchase','conversion','refund','bonus','subscription','admin_adjust') NOT NULL,
            `amount` INT NOT NULL,
            `balance_after` INT UNSIGNED NOT NULL,
            `description` VARCHAR(255) DEFAULT NULL,
            `reference_id` VARCHAR(100) DEFAULT NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_user_id` (`user_id`),
            KEY `idx_type` (`type`),
            CONSTRAINT `fk_credits_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Subscriptions
        "CREATE TABLE IF NOT EXISTS `subscriptions` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `user_id` INT UNSIGNED NOT NULL,
            `plan` ENUM('professional','enterprise') NOT NULL,
            `status` ENUM('active','cancelled','expired','past_due') NOT NULL DEFAULT 'active',
            `monthly_credits` INT UNSIGNED NOT NULL,
            `price_monthly` DECIMAL(10,2) NOT NULL,
            `start_date` DATE NOT NULL,
            `end_date` DATE NOT NULL,
            `auto_renew` TINYINT(1) NOT NULL DEFAULT 1,
            `stripe_subscription_id` VARCHAR(100) DEFAULT NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_user_id` (`user_id`),
            CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // System settings
        "CREATE TABLE IF NOT EXISTS `system_settings` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `setting_key` VARCHAR(100) NOT NULL,
            `setting_value` TEXT DEFAULT NULL,
            `setting_group` VARCHAR(50) NOT NULL DEFAULT 'general',
            `description` VARCHAR(255) DEFAULT NULL,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_key` (`setting_key`),
            KEY `idx_group` (`setting_group`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // DB Migrations
        "CREATE TABLE IF NOT EXISTS `db_migrations` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `version` VARCHAR(20) NOT NULL,
            `migration_file` VARCHAR(255) NOT NULL,
            `description` VARCHAR(255) DEFAULT NULL,
            `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_version` (`version`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Activity log
        "CREATE TABLE IF NOT EXISTS `activity_log` (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    ];
    
    foreach ($queries as $query) {
        $result = mysqli_query($conn, $query);
        if (!$result) {
            return ['success' => false, 'error' => mysqli_error($conn)];
        }
    }
    
    // Insert default settings
    $defaults = [
        ['app_name', APP_NAME, 'general', 'Application name'],
        ['app_version', APP_VERSION, 'system', 'Current version'],
        ['max_upload_size', '524288000', 'upload', 'Max upload in bytes (500MB)'],
        ['allowed_extensions', 'pptx', 'upload', 'Allowed file types'],
        ['credits_480p', '1', 'credits', 'Credits for 480p'],
        ['credits_720p', '2', 'credits', 'Credits for 720p'],
        ['credits_1080p', '3', 'credits', 'Credits for 1080p'],
        ['free_monthly_credits', '5', 'credits', 'Free plan credits'],
        ['pro_monthly_credits', '50', 'credits', 'Pro plan credits'],
        ['enterprise_monthly_credits', '200', 'credits', 'Enterprise credits'],
        ['max_queue_size', '50', 'system', 'Max concurrent jobs'],
        ['maintenance_mode', '0', 'system', 'Maintenance mode'],
        ['registration_enabled', '1', 'auth', 'Allow registration'],
    ];
    
    foreach ($defaults as $s) {
        $stmt = mysqli_prepare($conn, "INSERT INTO system_settings (setting_key, setting_value, setting_group, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)");
        mysqli_stmt_bind_param($stmt, 'ssss', $s[0], $s[1], $s[2], $s[3]);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    }
    
    // Record migration
    $stmt = mysqli_prepare($conn, "INSERT INTO db_migrations (version, migration_file, description) VALUES (?, ?, ?)");
    $ver = APP_VERSION;
    $file = 'install_v' . str_replace('.', '_', APP_VERSION) . '.sql';
    $desc = 'Initial installation v' . APP_VERSION;
    mysqli_stmt_bind_param($stmt, 'sss', $ver, $file, $desc);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    
    return ['success' => true];
}

// ============================================
// HANDLE FORM SUBMISSIONS
// ============================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($step === 2) {
        $db_host = trim($_POST['db_host'] ?? 'localhost');
        $db_name = trim($_POST['db_name'] ?? 'slidecast_pro');
        $db_user = trim($_POST['db_user'] ?? 'root');
        $db_pass = $_POST['db_pass'] ?? '';
        $db_port = intval($_POST['db_port'] ?? 3306);
        
        $conn = @mysqli_connect($db_host, $db_user, $db_pass, '', $db_port);
        if (!$conn) {
            $errors[] = 'Database connection failed: ' . mysqli_connect_error();
        } else {
            mysqli_query($conn, "CREATE DATABASE IF NOT EXISTS `{$db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            mysqli_select_db($conn, $db_name);
            
            $result = setup_database($conn);
            if ($result['success']) {
                // Write config file
                $config = "<?php\n";
                $config .= "/**\n * " . APP_NAME . " Configuration\n * Generated: " . date('Y-m-d H:i:s') . "\n */\n\n";
                $config .= "define('DB_HOST', '" . addslashes($db_host) . "');\n";
                $config .= "define('DB_NAME', '" . addslashes($db_name) . "');\n";
                $config .= "define('DB_USER', '" . addslashes($db_user) . "');\n";
                $config .= "define('DB_PASS', '" . addslashes($db_pass) . "');\n";
                $config .= "define('DB_PORT', " . $db_port . ");\n";
                $config .= "define('APP_VERSION', '" . APP_VERSION . "');\n";
                $config .= "define('INSTALLED', true);\n";
                
                file_put_contents(__DIR__ . '/config.php', $config);
                
                $_SESSION['install_db'] = true;
                header('Location: install.php?step=3');
                exit;
            } else {
                $errors[] = 'Database setup failed: ' . $result['error'];
            }
            mysqli_close($conn);
        }
    }
    
    if ($step === 3) {
        if (!file_exists(__DIR__ . '/config.php')) {
            $errors[] = 'Configuration file not found. Please go back to step 2.';
        } else {
            require_once __DIR__ . '/config.php';
            $conn = @mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            if (!$conn) {
                $errors[] = 'Cannot connect to database with saved config.';
            } else {
                $admin_name = trim($_POST['admin_name'] ?? '');
                $admin_email = trim($_POST['admin_email'] ?? '');
                $admin_pass = $_POST['admin_pass'] ?? '';
                $admin_role = $_POST['admin_role'] ?? 'admin';
                
                if (empty($admin_name) || empty($admin_email)) {
                    $errors[] = 'Name and email are required.';
                } elseif (strlen($admin_pass) < 8) {
                    $errors[] = 'Password must be at least 8 characters.';
                } elseif (!filter_var($admin_email, FILTER_VALIDATE_EMAIL)) {
                    $errors[] = 'Invalid email address.';
                } else {
                    $hash = password_hash($admin_pass, PASSWORD_DEFAULT);
                    $stmt = mysqli_prepare($conn, "INSERT INTO users (name, email, password_hash, role, credits, plan, status) VALUES (?, ?, ?, ?, 9999, 'enterprise', 'active')");
                    $role = 'admin';
                    mysqli_stmt_bind_param($stmt, 'ssss', $admin_name, $admin_email, $hash, $role);
                    
                    if (mysqli_stmt_execute($stmt)) {
                        $_SESSION['install_complete'] = true;
                        header('Location: install.php?step=4');
                        exit;
                    } else {
                        $errors[] = 'Failed to create admin: ' . mysqli_stmt_error($stmt);
                    }
                    mysqli_stmt_close($stmt);
                }
                mysqli_close($conn);
            }
        }
    }
}

$requirements = ($step === 1) ? check_requirements() : [];
$critical_failures = array_filter($requirements, fn($r) => !$r['status'] && $r['critical']);
$all_critical_passed = empty($critical_failures);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo APP_NAME; ?> - Installation Wizard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    <style>
        body { background: linear-gradient(135deg, #020617 0%, #0f172a 100%); min-height: 100vh; color: #e2e8f0; }
        .install-card { background: rgba(15,23,42,0.9); border: 1px solid rgba(99,102,241,0.2); border-radius: 20px; backdrop-filter: blur(10px); }
        .step-indicator { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .step-active { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; }
        .step-done { background: #10b981; color: white; }
        .step-pending { background: rgba(99,102,241,0.15); color: #64748b; }
        .form-control { background: rgba(15,23,42,0.8); border: 1px solid rgba(99,102,241,0.2); color: #e2e8f0; border-radius: 10px; padding: 0.75rem 1rem; }
        .form-control:focus { background: rgba(15,23,42,0.95); border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); color: #e2e8f0; }
        .btn-install { background: linear-gradient(135deg, #6366f1, #4f46e5); border: none; color: white; padding: 0.75rem 2rem; border-radius: 12px; font-weight: 600; }
        .btn-install:hover { background: linear-gradient(135deg, #818cf8, #6366f1); color: white; transform: translateY(-1px); }
    </style>
</head>
<body>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <!-- Header -->
                <div class="text-center mb-5">
                    <h1 class="display-4 fw-bold mb-2">
                        <i class="fas fa-film me-2" style="color: #6366f1;"></i>
                        <?php echo APP_NAME; ?>
                    </h1>
                    <p class="lead text-secondary">Installation Wizard v<?php echo APP_VERSION; ?></p>
                </div>
                
                <!-- Steps -->
                <div class="d-flex justify-content-center align-items-center mb-5 gap-2">
                    <?php
                    $steps = ['Requirements', 'Database', 'Admin', 'Complete'];
                    foreach ($steps as $i => $s):
                        $class = ($step > $i+1) ? 'step-done' : (($step === $i+1) ? 'step-active' : 'step-pending');
                    ?>
                    <div class="text-center">
                        <div class="step-indicator <?php echo $class; ?> mx-auto mb-2">
                            <?php echo ($step > $i+1) ? '<i class="fas fa-check"></i>' : ($i+1); ?>
                        </div>
                        <small class="text-secondary d-none d-sm-block"><?php echo $s; ?></small>
                    </div>
                    <?php if ($i < 3): ?>
                    <div class="flex-grow-1" style="height: 2px; background: <?php echo ($step > $i+1) ? '#10b981' : 'rgba(99,102,241,0.2)'; ?>; max-width: 60px;"></div>
                    <?php endif; ?>
                    <?php endforeach; ?>
                </div>
                
                <!-- Errors -->
                <?php if (!empty($errors)): ?>
                <div class="alert alert-danger border-0 rounded-3 mb-4" style="background: rgba(239,68,68,0.1); color: #fca5a5;">
                    <?php foreach ($errors as $e): ?>
                    <div><i class="fas fa-exclamation-circle me-2"></i><?php echo $e; ?></div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
                
                <!-- Step Content -->
                <div class="install-card p-4 p-md-5">
                    <?php if ($step === 1): ?>
                    <h4 class="text-light mb-4"><i class="fas fa-clipboard-check me-2" style="color:#6366f1"></i>System Requirements</h4>
                    <div class="table-responsive">
                        <table class="table table-borderless mb-4">
                            <?php foreach ($requirements as $key => $req): ?>
                            <tr>
                                <td class="text-secondary py-2"><?php echo $req['name']; ?>
                                    <?php if ($req['critical']): ?><span class="badge bg-danger ms-1" style="font-size:0.6rem">Required</span><?php endif; ?>
                                </td>
                                <td class="text-end py-2">
                                    <?php if ($req['status']): ?>
                                        <span class="badge bg-success"><i class="fas fa-check me-1"></i><?php echo $req['current']; ?></span>
                                    <?php else: ?>
                                        <span class="badge bg-danger"><i class="fas fa-times me-1"></i><?php echo $req['current']; ?></span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </table>
                    </div>
                    <?php if ($all_critical_passed): ?>
                    <div class="alert border-0 rounded-3 mb-3" style="background: rgba(16,185,129,0.1); color: #6ee7b7;">
                        <i class="fas fa-check-circle me-2"></i>All critical requirements met! Ready to proceed.
                    </div>
                    <a href="install.php?step=2" class="btn btn-install">Continue to Database Setup <i class="fas fa-arrow-right ms-2"></i></a>
                    <?php else: ?>
                    <div class="alert border-0 rounded-3" style="background: rgba(239,68,68,0.1); color: #fca5a5;">
                        <i class="fas fa-exclamation-triangle me-2"></i>Please fix the critical requirements before continuing.
                    </div>
                    <a href="install.php?step=1" class="btn btn-outline-light">Re-check Requirements</a>
                    <?php endif; ?>
                    
                    <?php elseif ($step === 2): ?>
                    <h4 class="text-light mb-4"><i class="fas fa-database me-2" style="color:#0ea5e9"></i>Database Configuration</h4>
                    <form method="POST">
                        <div class="row g-3">
                            <div class="col-md-8">
                                <label class="form-label text-secondary small">Database Host</label>
                                <input type="text" name="db_host" class="form-control" value="localhost" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label text-secondary small">Port</label>
                                <input type="number" name="db_port" class="form-control" value="3306">
                            </div>
                            <div class="col-12">
                                <label class="form-label text-secondary small">Database Name</label>
                                <input type="text" name="db_name" class="form-control" value="slidecast_pro" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-secondary small">Database User</label>
                                <input type="text" name="db_user" class="form-control" value="root" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-secondary small">Database Password</label>
                                <input type="password" name="db_pass" class="form-control">
                            </div>
                        </div>
                        <div class="mt-4">
                            <button type="submit" class="btn btn-install">
                                <i class="fas fa-download me-2"></i>Install Database
                            </button>
                        </div>
                    </form>
                    
                    <?php elseif ($step === 3): ?>
                    <h4 class="text-light mb-4"><i class="fas fa-user-shield me-2" style="color:#f59e0b"></i>Create Admin Account</h4>
                    <form method="POST">
                        <div class="mb-3">
                            <label class="form-label text-secondary small">Admin Full Name</label>
                            <input type="text" name="admin_name" class="form-control" placeholder="Administrator" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-secondary small">Admin Email</label>
                            <input type="email" name="admin_email" class="form-control" placeholder="admin@example.com" required>
                        </div>
                        <div class="mb-4">
                            <label class="form-label text-secondary small">Password (min 8 characters)</label>
                            <input type="password" name="admin_pass" class="form-control" minlength="8" required>
                        </div>
                        <button type="submit" class="btn btn-install">
                            <i class="fas fa-user-plus me-2"></i>Create Admin Account
                        </button>
                    </form>
                    
                    <?php elseif ($step === 4): ?>
                    <div class="text-center py-4">
                        <div class="mb-4">
                            <i class="fas fa-check-circle fa-5x text-success"></i>
                        </div>
                        <h3 class="text-light mb-3">Installation Complete!</h3>
                        <p class="text-secondary mb-4">
                            <?php echo APP_NAME; ?> v<?php echo APP_VERSION; ?> has been successfully installed and is ready to use.
                        </p>
                        <div class="alert border-0 rounded-3 mb-4 text-start" style="background: rgba(245,158,11,0.1); color: #fcd34d;">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Security:</strong> Please delete or rename <code>install.php</code> for security.
                        </div>
                        <a href="index.php" class="btn btn-install btn-lg">
                            <i class="fas fa-rocket me-2"></i>Launch <?php echo APP_NAME; ?>
                        </a>
                    </div>
                    <?php endif; ?>
                </div>
                
                <div class="text-center mt-4">
                    <small class="text-secondary">© 2026 <?php echo APP_NAME; ?>. Installable & Upgradeable Platform.</small>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
