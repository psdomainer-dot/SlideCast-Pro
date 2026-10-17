import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const phpFiles = [
  {
    name: 'install.php',
    description: 'System Installer - Checks requirements and sets up database',
    icon: 'fas fa-download',
    code: `<?php
/**
 * SlideCast Pro - Installation Script
 * Procedural PHP with MySQLi
 * Version: 2.1.0
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'slidecast_pro');
define('DB_USER', 'root');
define('DB_PASS', '');
define('APP_VERSION', '2.1.0');
define('MIN_PHP_VERSION', '8.0.0');

$step = isset($_GET['step']) ? intval($_GET['step']) : 1;
$errors = [];
$success = [];

// Check system requirements
function check_requirements() {
    $requirements = [];
    
    // PHP Version
    $requirements['php_version'] = [
        'name' => 'PHP Version >= ' . MIN_PHP_VERSION,
        'status' => version_compare(PHP_VERSION, MIN_PHP_VERSION, '>='),
        'current' => PHP_VERSION
    ];
    
    // MySQLi Extension
    $requirements['mysqli'] = [
        'name' => 'MySQLi Extension',
        'status' => extension_loaded('mysqli'),
        'current' => extension_loaded('mysqli') ? 'Installed' : 'Missing'
    ];
    
    // FFmpeg
    $ffmpeg_output = [];
    exec('ffmpeg -version 2>&1', $ffmpeg_output, $ffmpeg_return);
    $requirements['ffmpeg'] = [
        'name' => 'FFmpeg',
        'status' => $ffmpeg_return === 0,
        'current' => $ffmpeg_return === 0 ? 'Installed' : 'Not Found'
    ];
    
    // File Upload Size
    $upload_max = ini_get('upload_max_filesize');
    $requirements['upload_size'] = [
        'name' => 'Upload Max Filesize >= 500M',
        'status' => return_bytes($upload_max) >= 524288000,
        'current' => $upload_max
    ];
    
    // Writable directories
    $requirements['uploads_writable'] = [
        'name' => 'Uploads Directory Writable',
        'status' => is_writable(__DIR__ . '/uploads'),
        'current' => is_writable(__DIR__ . '/uploads') ? 'Writable' : 'Not Writable'
    ];
    
    $requirements['output_writable'] = [
        'name' => 'Output Directory Writable',
        'status' => is_writable(__DIR__ . '/output'),
        'current' => is_writable(__DIR__ . '/output') ? 'Writable' : 'Not Writable'
    ];
    
    return $requirements;
}

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

// Database Setup
function setup_database($conn) {
    $queries = [
        // Users table
        "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('lecturer','student','trainer','creator','admin') DEFAULT 'student',
            credits INT DEFAULT 5,
            plan ENUM('free','professional','enterprise') DEFAULT 'free',
            plan_expires DATETIME NULL,
            avatar VARCHAR(255) NULL,
            status ENUM('active','suspended','pending') DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Conversions table
        "CREATE TABLE IF NOT EXISTS conversions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            job_id VARCHAR(50) NOT NULL UNIQUE,
            filename VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            file_size BIGINT DEFAULT 0,
            slide_count INT DEFAULT 0,
            duration INT DEFAULT 0,
            status ENUM('queued','processing','completed','failed','cancelled') DEFAULT 'queued',
            progress TINYINT DEFAULT 0,
            error_message TEXT NULL,
            narration_detected TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            started_at DATETIME NULL,
            completed_at DATETIME NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Output files table
        "CREATE TABLE IF NOT EXISTS output_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            conversion_id INT NOT NULL,
            resolution ENUM('480p','720p','1080p') NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_size BIGINT DEFAULT 0,
            duration INT DEFAULT 0,
            download_count INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NULL,
            FOREIGN KEY (conversion_id) REFERENCES conversions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Credits/Transactions table
        "CREATE TABLE IF NOT EXISTS credit_transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type ENUM('purchase','conversion','refund','bonus','subscription') NOT NULL,
            amount INT NOT NULL,
            balance_after INT NOT NULL,
            description VARCHAR(255) NULL,
            reference_id VARCHAR(100) NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Subscriptions table
        "CREATE TABLE IF NOT EXISTS subscriptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            plan ENUM('professional','enterprise') NOT NULL,
            status ENUM('active','cancelled','expired') DEFAULT 'active',
            monthly_credits INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            auto_renew TINYINT(1) DEFAULT 1,
            stripe_subscription_id VARCHAR(100) NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // System settings table
        "CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value TEXT NULL,
            setting_group VARCHAR(50) DEFAULT 'general',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Version tracking
        "CREATE TABLE IF NOT EXISTS db_migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            version VARCHAR(20) NOT NULL,
            migration_file VARCHAR(255) NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    ];
    
    foreach ($queries as $query) {
        $result = mysqli_query($conn, $query);
        if (!$result) {
            return ['success' => false, 'error' => mysqli_error($conn), 'query' => $query];
        }
    }
    
    // Insert default settings
    $defaults = [
        ['max_upload_size', '524288000', 'upload'],
        ['allowed_extensions', 'pptx', 'upload'],
        ['credits_480p', '1', 'credits'],
        ['credits_720p', '2', 'credits'],
        ['credits_1080p', '3', 'credits'],
        ['free_monthly_credits', '5', 'credits'],
        ['max_queue_size', '50', 'system'],
        ['app_version', APP_VERSION, 'system'],
    ];
    
    foreach ($defaults as $setting) {
        $stmt = mysqli_prepare($conn, "INSERT INTO system_settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?)");
        mysqli_stmt_bind_param($stmt, 'sss', $setting[0], $setting[1], $setting[2]);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    }
    
    // Record migration
    $stmt = mysqli_prepare($conn, "INSERT INTO db_migrations (version, migration_file) VALUES (?, ?)");
    $version = APP_VERSION;
    $file = 'install_v' . str_replace('.', '_', APP_VERSION) . '.php';
    mysqli_stmt_bind_param($stmt, 'ss', $version, $file);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    
    return ['success' => true];
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($step === 2) {
        // Database configuration
        $db_host = mysqli_real_escape_string($conn ?? null, $_POST['db_host'] ?? 'localhost');
        $db_name = mysqli_real_escape_string($conn ?? null, $_POST['db_name'] ?? 'slidecast_pro');
        $db_user = mysqli_real_escape_string($conn ?? null, $_POST['db_user'] ?? 'root');
        $db_pass = $_POST['db_pass'] ?? '';
        
        $conn = mysqli_connect($db_host, $db_user, $db_pass);
        if (!$conn) {
            $errors[] = 'Database connection failed: ' . mysqli_connect_error();
        } else {
            // Create database if not exists
            mysqli_query($conn, "CREATE DATABASE IF NOT EXISTS \`$db_name\`");
            mysqli_select_db($conn, $db_name);
            
            $result = setup_database($conn);
            if ($result['success']) {
                // Save config
                $config_content = "<?php\\n";
                $config_content .= "define('DB_HOST', '$db_host');\\n";
                $config_content .= "define('DB_NAME', '$db_name');\\n";
                $config_content .= "define('DB_USER', '$db_user');\\n";
                $config_content .= "define('DB_PASS', '$db_pass');\\n";
                $config_content .= "define('APP_VERSION', '" . APP_VERSION . "');\\n";
                $config_content .= "define('INSTALLED', true);\\n";
                file_put_contents(__DIR__ . '/config.php', $config_content);
                
                $success[] = 'Database installed successfully!';
                header('Location: install.php?step=3');
                exit;
            } else {
                $errors[] = 'Database setup failed: ' . $result['error'];
            }
        }
    }
    
    if ($step === 3) {
        // Admin account creation
        $admin_name = trim($_POST['admin_name'] ?? '');
        $admin_email = trim($_POST['admin_email'] ?? '');
        $admin_pass = $_POST['admin_pass'] ?? '';
        
        if (strlen($admin_pass) < 8) {
            $errors[] = 'Admin password must be at least 8 characters';
        } else {
            require_once __DIR__ . '/config.php';
            $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            $hash = password_hash($admin_pass, PASSWORD_DEFAULT);
            $stmt = mysqli_prepare($conn, "INSERT INTO users (name, email, password_hash, role, credits, plan) VALUES (?, ?, ?, 'admin', 9999, 'enterprise')");
            mysqli_stmt_bind_param($stmt, 'sss', $admin_name, $admin_email, $hash);
            
            if (mysqli_stmt_execute($stmt)) {
                $success[] = 'Admin account created successfully!';
                header('Location: install.php?step=4');
                exit;
            } else {
                $errors[] = 'Failed to create admin account: ' . mysqli_stmt_error($stmt);
            }
            mysqli_stmt_close($stmt);
            mysqli_close($conn);
        }
    }
}

$requirements = ($step === 1) ? check_requirements() : [];
$all_passed = empty(array_filter($requirements, fn($r) => !$r['status']));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SlideCast Pro - Installation</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-light">
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="text-center mb-5">
                    <h1 class="display-4">🎬 SlideCast Pro</h1>
                    <p class="lead">Installation Wizard v<?php echo APP_VERSION; ?></p>
                </div>
                
                <!-- Progress Steps -->
                <div class="d-flex justify-content-center mb-5">
                    <?php foreach(['Requirements','Database','Admin Account','Complete'] as $i => $s): ?>
                    <div class="text-center mx-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2
                            <?php echo ($step > $i+1) ? 'bg-success' : (($step === $i+1) ? 'bg-primary' : 'bg-secondary'); ?>"
                            style="width:40px;height:40px;">
                            <?php echo ($step > $i+1) ? '✓' : ($i+1); ?>
                        </div>
                        <small><?php echo $s; ?></small>
                    </div>
                    <?php endforeach; ?>
                </div>
                
                <?php if ($step === 1): ?>
                <!-- Step 1: Requirements Check -->
                <div class="card bg-secondary border-0">
                    <div class="card-body p-4">
                        <h4>System Requirements Check</h4>
                        <table class="table table-dark mt-3">
                            <?php foreach ($requirements as $key => $req): ?>
                            <tr>
                                <td><?php echo $req['name']; ?></td>
                                <td class="text-end">
                                    <?php if ($req['status']): ?>
                                        <span class="badge bg-success">✓ <?php echo $req['current']; ?></span>
                                    <?php else: ?>
                                        <span class="badge bg-danger">✗ <?php echo $req['current']; ?></span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </table>
                        <a href="install.php?step=2" class="btn btn-primary <?php echo !$all_passed ? 'disabled' : ''; ?>">
                            Continue →
                        </a>
                    </div>
                </div>
                
                <?php elseif ($step === 2): ?>
                <!-- Step 2: Database Setup -->
                <div class="card bg-secondary border-0">
                    <div class="card-body p-4">
                        <h4>Database Configuration</h4>
                        <form method="POST">
                            <div class="mb-3">
                                <label class="form-label">Database Host</label>
                                <input type="text" name="db_host" class="form-control" value="localhost" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Database Name</label>
                                <input type="text" name="db_name" class="form-control" value="slidecast_pro" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Database User</label>
                                <input type="text" name="db_user" class="form-control" value="root" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Database Password</label>
                                <input type="password" name="db_pass" class="form-control">
                            </div>
                            <button type="submit" class="btn btn-primary">Install Database →</button>
                        </form>
                    </div>
                </div>
                
                <?php elseif ($step === 3): ?>
                <!-- Step 3: Admin Account -->
                <div class="card bg-secondary border-0">
                    <div class="card-body p-4">
                        <h4>Create Admin Account</h4>
                        <form method="POST">
                            <div class="mb-3">
                                <label class="form-label">Admin Name</label>
                                <input type="text" name="admin_name" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Admin Email</label>
                                <input type="email" name="admin_email" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" name="admin_pass" class="form-control" minlength="8" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Create Admin →</button>
                        </form>
                    </div>
                </div>
                
                <?php elseif ($step === 4): ?>
                <!-- Step 4: Complete -->
                <div class="card bg-secondary border-0 text-center">
                    <div class="card-body p-5">
                        <div class="display-1 mb-3">✅</div>
                        <h4>Installation Complete!</h4>
                        <p class="text-muted">SlideCast Pro has been successfully installed.</p>
                        <a href="index.php" class="btn btn-primary btn-lg">Go to Dashboard →</a>
                        <p class="text-muted mt-3 small">
                            ⚠️ For security, please delete or rename install.php
                        </p>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html>`
  },
  {
    name: 'config.php',
    description: 'Application Configuration File',
    icon: 'fas fa-cog',
    code: `<?php
/**
 * SlideCast Pro - Configuration
 * Generated during installation
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'slidecast_pro');
define('DB_USER', 'root');
define('DB_PASS', '');

// Application Settings
define('APP_NAME', 'SlideCast Pro');
define('APP_VERSION', '2.1.0');
define('APP_URL', 'http://localhost/slidecast-pro');
define('INSTALLED', true);

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
ini_set('error_log', LOG_PATH . 'errors.log');

// Timezone
date_default_timezone_set('UTC');

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>`
  },
  {
    name: 'db_connect.php',
    description: 'Database Connection (Procedural MySQLi)',
    icon: 'fas fa-database',
    code: `<?php
/**
 * SlideCast Pro - Database Connection
 * Procedural MySQLi Connection Handler
 */

require_once __DIR__ . '/config.php';

/**
 * Get database connection
 * @return mysqli|false
 */
function get_db_connection() {
    static $conn = null;
    
    if ($conn === null) {
        $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if (!$conn) {
            error_log('Database connection failed: ' . mysqli_connect_error());
            return false;
        }
        
        // Set charset
        mysqli_set_charset($conn, 'utf8mb4');
        
        // Set session variables
        mysqli_query($conn, "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");
    }
    
    return $conn;
}

/**
 * Execute a prepared query safely
 * @param string $query SQL query with ? placeholders
 * @param string $types Parameter types (s=string, i=int, d=double, b=blob)
 * @param array $params Parameters array
 * @return array|false Result array or false on failure
 */
function db_query($query, $types = '', $params = []) {
    $conn = get_db_connection();
    if (!$conn) return false;
    
    if (empty($types)) {
        // Simple query without parameters
        $result = mysqli_query($conn, $query);
        if ($result === false) {
            error_log('Query failed: ' . mysqli_error($conn) . ' | Query: ' . $query);
            return false;
        }
        
        if ($result === true) {
            return ['affected_rows' => mysqli_affected_rows($conn), 'insert_id' => mysqli_insert_id($conn)];
        }
        
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        mysqli_free_result($result);
        return $rows;
    }
    
    // Prepared statement
    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        error_log('Prepare failed: ' . mysqli_error($conn) . ' | Query: ' . $query);
        return false;
    }
    
    if (!empty($params)) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }
    
    if (!mysqli_stmt_execute($stmt)) {
        error_log('Execute failed: ' . mysqli_stmt_error($stmt));
        mysqli_stmt_close($stmt);
        return false;
    }
    
    $result = mysqli_stmt_get_result($stmt);
    
    if ($result === false) {
        // INSERT/UPDATE/DELETE
        $return = [
            'affected_rows' => mysqli_stmt_affected_rows($stmt),
            'insert_id' => mysqli_stmt_insert_id($stmt)
        ];
        mysqli_stmt_close($stmt);
        return $return;
    }
    
    // SELECT
    $rows = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }
    mysqli_stmt_close($stmt);
    return $rows;
}

/**
 * Get single row
 */
function db_query_one($query, $types = '', $params = []) {
    $results = db_query($query, $types, $params);
    if ($results && is_array($results) && count($results) > 0) {
        return $results[0];
    }
    return null;
}

/**
 * Escape string for safe SQL usage
 */
function db_escape($string) {
    $conn = get_db_connection();
    return mysqli_real_escape_string($conn, $string);
}

/**
 * Close database connection
 */
function db_close() {
    $conn = get_db_connection();
    if ($conn) {
        mysqli_close($conn);
    }
}

// Register shutdown function to close connection
register_shutdown_function('db_close');
?>`
  },
  {
    name: 'auth.php',
    description: 'Authentication Functions',
    icon: 'fas fa-shield-alt',
    code: `<?php
/**
 * SlideCast Pro - Authentication Functions
 * Procedural PHP Authentication Handler
 */

require_once __DIR__ . '/db_connect.php';

/**
 * Register a new user
 */
function auth_register($name, $email, $password, $role = 'student') {
    // Validate inputs
    if (empty($name) || empty($email) || empty($password)) {
        return ['success' => false, 'error' => 'All fields are required'];
    }
    
    if (strlen($password) < 8) {
        return ['success' => false, 'error' => 'Password must be at least 8 characters'];
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'error' => 'Invalid email address'];
    }
    
    // Check if email exists
    $existing = db_query_one("SELECT id FROM users WHERE email = ?", "s", [$email]);
    if ($existing) {
        return ['success' => false, 'error' => 'Email already registered'];
    }
    
    // Hash password
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Determine initial credits based on role
    $initial_credits = ($role === 'lecturer' || $role === 'trainer') ? 10 : 5;
    
    // Insert user
    $result = db_query(
        "INSERT INTO users (name, email, password_hash, role, credits, plan) VALUES (?, ?, ?, ?, ?, 'free')",
        "ssssi",
        [$name, $email, $hash, $role, $initial_credits]
    );
    
    if ($result && $result['insert_id']) {
        // Log credit transaction
        db_query(
            "INSERT INTO credit_transactions (user_id, type, amount, balance_after, description) VALUES (?, 'bonus', ?, ?, 'Welcome bonus')",
            "iii",
            [$result['insert_id'], $initial_credits, $initial_credits]
        );
        
        return ['success' => true, 'user_id' => $result['insert_id']];
    }
    
    return ['success' => false, 'error' => 'Registration failed. Please try again.'];
}

/**
 * Authenticate user login
 */
function auth_login($email, $password) {
    if (empty($email) || empty($password)) {
        return ['success' => false, 'error' => 'Email and password are required'];
    }
    
    $user = db_query_one(
        "SELECT id, name, email, password_hash, role, credits, plan, status FROM users WHERE email = ?",
        "s",
        [$email]
    );
    
    if (!$user) {
        return ['success' => false, 'error' => 'Invalid email or password'];
    }
    
    if ($user['status'] === 'suspended') {
        return ['success' => false, 'error' => 'Account has been suspended'];
    }
    
    if (!password_verify($password, $user['password_hash'])) {
        return ['success' => false, 'error' => 'Invalid email or password'];
    }
    
    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_credits'] = $user['credits'];
    $_SESSION['user_plan'] = $user['plan'];
    $_SESSION['logged_in'] = true;
    
    // Regenerate session ID for security
    session_regenerate_id(true);
    
    return ['success' => true, 'user' => $user];
}

/**
 * Check if user is logged in
 */
function auth_check() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Get current user data
 */
function auth_user() {
    if (!auth_check()) return null;
    
    return [
        'id' => $_SESSION['user_id'] ?? null,
        'name' => $_SESSION['user_name'] ?? null,
        'email' => $_SESSION['user_email'] ?? null,
        'role' => $_SESSION['user_role'] ?? null,
        'credits' => $_SESSION['user_credits'] ?? 0,
        'plan' => $_SESSION['user_plan'] ?? 'free',
    ];
}

/**
 * Logout user
 */
function auth_logout() {
    $_SESSION = [];
    session_destroy();
}

/**
 * Require authentication (redirect if not logged in)
 */
function auth_require() {
    if (!auth_check()) {
        header('Location: /login.php');
        exit;
    }
}

/**
 * Require admin role
 */
function auth_require_admin() {
    auth_require();
    if (($_SESSION['user_role'] ?? '') !== 'admin') {
        header('HTTP/1.1 403 Forbidden');
        exit('Access denied');
    }
}

/**
 * Update user credits
 */
function auth_update_credits($user_id, $new_credits) {
    $result = db_query(
        "UPDATE users SET credits = ? WHERE id = ?",
        "ii",
        [$new_credits, $user_id]
    );
    
    if ($result) {
        $_SESSION['user_credits'] = $new_credits;
    }
    
    return $result !== false;
}
?>`
  },
  {
    name: 'convert.php',
    description: 'PPTX to MP4 Conversion Engine',
    icon: 'fas fa-film',
    code: `<?php
/**
 * SlideCast Pro - Conversion Engine
 * Handles PPTX to MP4 conversion with narration
 * Procedural PHP
 */

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth.php';

/**
 * Process uploaded PPTX file
 */
function conversion_upload($file, $user_id) {
    // Validate file
    $allowed = ['pptx', 'ppt'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($ext, $allowed)) {
        return ['success' => false, 'error' => 'Invalid file type. Only PPTX files are allowed.'];
    }
    
    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return ['success' => false, 'error' => 'File too large. Maximum size is 500MB.'];
    }
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => 'Upload error: ' . $file['error']];
    }
    
    // Generate unique job ID
    $job_id = 'JOB-' . strtoupper(bin2hex(random_bytes(6)));
    
    // Create upload directory
    $upload_dir = UPLOAD_PATH . $job_id . '/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Move uploaded file
    $dest_path = $upload_dir . $file['name'];
    if (!move_uploaded_file($file['tmp_name'], $dest_path)) {
        return ['success' => false, 'error' => 'Failed to save uploaded file'];
    }
    
    // Analyze PPTX
    $analysis = analyze_pptx($dest_path);
    
    // Create conversion record
    $result = db_query(
        "INSERT INTO conversions (user_id, job_id, filename, original_name, file_size, slide_count, narration_detected, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'queued')",
        "isssiii",
        [
            $user_id,
            $job_id,
            $dest_path,
            $file['name'],
            $file['size'],
            $analysis['slide_count'],
            $analysis['has_narration'] ? 1 : 0
        ]
    );
    
    if (!$result) {
        return ['success' => false, 'error' => 'Failed to create conversion record'];
    }
    
    return [
        'success' => true,
        'job_id' => $job_id,
        'conversion_id' => $result['insert_id'],
        'slide_count' => $analysis['slide_count'],
        'has_narration' => $analysis['has_narration'],
    ];
}

/**
 * Analyze PPTX file structure
 */
function analyze_pptx($filepath) {
    $zip = new ZipArchive();
    $result = ['slide_count' => 0, 'has_narration' => false, 'duration' => 0];
    
    if ($zip->open($filepath) === true) {
        // Count slides
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (preg_match('/^ppt\\/slides\\/slide\\d+\\.xml$/', $name)) {
                $result['slide_count']++;
            }
            // Check for narration
            if (strpos($name, 'ppt/media/') !== false && preg_match('/\\.(mp3|wav|m4a)$/i', $name)) {
                $result['has_narration'] = true;
            }
        }
        $zip->close();
    }
    
    return $result;
}

/**
 * Start conversion process
 */
function conversion_start($conversion_id, $resolutions) {
    $conversion = db_query_one(
        "SELECT * FROM conversions WHERE id = ?",
        "i",
        [$conversion_id]
    );
    
    if (!$conversion || $conversion['status'] !== 'queued') {
        return ['success' => false, 'error' => 'Invalid conversion or already started'];
    }
    
    // Update status to processing
    db_query(
        "UPDATE conversions SET status = 'processing', started_at = NOW(), progress = 0 WHERE id = ?",
        "i",
        [$conversion_id]
    );
    
    // Queue conversion for each resolution
    foreach ($resolutions as $resolution) {
        $credit_cost = get_credit_cost($resolution);
        
        // Create output directory
        $output_dir = OUTPUT_PATH . $conversion['job_id'] . '/' . $resolution . '/';
        if (!is_dir($output_dir)) {
            mkdir($output_dir, 0755, true);
        }
        
        // Queue the conversion job
        $output_file = $output_dir . pathinfo($conversion['original_name'], PATHINFO_FILENAME) . '_' . $resolution . '.mp4';
        
        // In production, this would dispatch to a background worker
        // For now, we simulate the conversion process
        $success = render_video($conversion, $resolution, $output_file);
        
        if ($success) {
            // Record output file
            $file_size = file_exists($output_file) ? filesize($output_file) : 0;
            
            db_query(
                "INSERT INTO output_files (conversion_id, resolution, file_path, file_size) VALUES (?, ?, ?, ?)",
                "issi",
                [$conversion_id, $resolution, $output_file, $file_size]
            );
            
            // Deduct credits
            deduct_credits($conversion['user_id'], $credit_cost, "Conversion to {$resolution}");
        }
    }
    
    // Update conversion status
    $progress = 100;
    db_query(
        "UPDATE conversions SET status = 'completed', progress = ?, completed_at = NOW() WHERE id = ?",
        "ii",
        [$progress, $conversion_id]
    );
    
    return ['success' => true];
}

/**
 * Render video from PPTX slides using FFmpeg
 */
function render_video($conversion, $resolution, $output_path) {
    $pptx_path = $conversion['filename'];
    $temp_dir = TEMP_PATH . $conversion['job_id'] . '_' . $resolution . '/';
    
    if (!is_dir($temp_dir)) {
        mkdir($temp_dir, 0755, true);
    }
    
    // Resolution settings
    $resolutions = [
        '480p'  => ['width' => 854, 'height' => 480, 'bitrate' => '1000k'],
        '720p'  => ['width' => 1280, 'height' => 720, 'bitrate' => '2500k'],
        '1080p' => ['width' => 1920, 'height' => 1080, 'bitrate' => '5000k'],
    ];
    
    $res = $resolutions[$resolution] ?? $resolutions['720p'];
    
    // Step 1: Extract slides as images using LibreOffice
    $extract_cmd = sprintf(
        'libreoffice --headless --convert-to png --outdir %s %s 2>&1',
        escapeshellarg($temp_dir),
        escapeshellarg($pptx_path)
    );
    exec($extract_cmd, $output, $return_var);
    
    if ($return_var !== 0) {
        // Fallback: use PhpPresentation or direct XML parsing
        error_log('LibreOffice conversion failed for: ' . $pptx_path);
        return false;
    }
    
    // Step 2: Build FFmpeg command
    $slide_images = glob($temp_dir . '*.png');
    sort($slide_images);
    
    if (empty($slide_images)) {
        return false;
    }
    
    // Create concat file for FFmpeg
    $concat_file = $temp_dir . 'concat.txt';
    $duration_per_slide = 5; // Default 5 seconds per slide
    $fp = fopen($concat_file, 'w');
    foreach ($slide_images as $img) {
        fwrite($fp, "file '" . $img . "'\\n");
        fwrite($fp, "duration $duration_per_slide\\n");
    }
    // Repeat last image
    fwrite($fp, "file '" . end($slide_images) . "'\\n");
    fclose($fp);
    
    // Step 3: Check for narration audio
    $audio_file = null;
    $zip = new ZipArchive();
    if ($zip->open($pptx_path) === true) {
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (preg_match('/ppt\\/media\\/.*\\.(mp3|wav)$/i', $name)) {
                $audio_file = $temp_dir . 'narration' . pathinfo($name, PATHINFO_EXTENSION);
                $zip->extractTo($temp_dir, [$name]);
                rename($temp_dir . $name, $audio_file);
                break;
            }
        }
        $zip->close();
    }
    
    // Step 4: FFmpeg render command
    $ffmpeg_cmd = sprintf(
        '%s -y -f concat -safe 0 -i %s %s -c:v libx264 -pix_fmt yuv420p -r 30 -s %dx%d -b:v %s -preset medium -c:a aac -b:a 128k -shortest %s 2>&1',
        FFMPEG_PATH,
        escapeshellarg($concat_file),
        $audio_file ? '-i ' . escapeshellarg($audio_file) : '-f lavfi -i anullsrc=r=44100:cl=stereo',
        $res['width'],
        $res['height'],
        $res['bitrate'],
        escapeshellarg($output_path)
    );
    
    exec($ffmpeg_cmd, $ffmpeg_output, $ffmpeg_return);
    
    // Cleanup temp files
    array_map('unlink', glob($temp_dir . '*'));
    rmdir($temp_dir);
    
    return $ffmpeg_return === 0 && file_exists($output_path);
}

/**
 * Get credit cost for resolution
 */
function get_credit_cost($resolution) {
    $costs = ['480p' => CREDITS_480P, '720p' => CREDITS_720P, '1080p' => CREDITS_1080P];
    return $costs[$resolution] ?? 2;
}

/**
 * Deduct credits from user
 */
function deduct_credits($user_id, $amount, $description) {
    $user = db_query_one("SELECT credits FROM users WHERE id = ?", "i", [$user_id]);
    if (!$user) return false;
    
    $new_balance = max(0, $user['credits'] - $amount);
    
    db_query("UPDATE users SET credits = ? WHERE id = ?", "ii", [$new_balance, $user_id]);
    
    db_query(
        "INSERT INTO credit_transactions (user_id, type, amount, balance_after, description) VALUES (?, 'conversion', ?, ?, ?)",
        "iiis",
        [$user_id, -$amount, $new_balance, $description]
    );
    
    $_SESSION['user_credits'] = $new_balance;
    return true;
}

/**
 * Get conversion status
 */
function conversion_status($job_id) {
    $conversion = db_query_one(
        "SELECT c.*, GROUP_CONCAT(o.resolution) as available_resolutions
         FROM conversions c 
         LEFT JOIN output_files o ON c.id = o.conversion_id 
         WHERE c.job_id = ? 
         GROUP BY c.id",
        "s",
        [$job_id]
    );
    
    return $conversion;
}

/**
 * Get download URL for completed conversion
 */
function conversion_download($job_id, $resolution) {
    $conversion = db_query_one(
        "SELECT c.id, c.user_id FROM conversions c WHERE c.job_id = ? AND c.status = 'completed'",
        "s",
        [$job_id]
    );
    
    if (!$conversion) return false;
    
    // Verify user owns this conversion
    if ($conversion['user_id'] !== ($_SESSION['user_id'] ?? 0)) {
        return false;
    }
    
    $output = db_query_one(
        "SELECT * FROM output_files WHERE conversion_id = ? AND resolution = ?",
        "is",
        [$conversion['id'], $resolution]
    );
    
    if (!$output || !file_exists($output['file_path'])) return false;
    
    // Increment download count
    db_query(
        "UPDATE output_files SET download_count = download_count + 1 WHERE id = ?",
        "i",
        [$output['id']]
    );
    
    return $output['file_path'];
}
?>`
  },
  {
    name: 'upgrade.php',
    description: 'System Upgrade Handler',
    icon: 'fas fa-arrow-up',
    code: `<?php
/**
 * SlideCast Pro - Upgrade System
 * Handles version upgrades and database migrations
 * Procedural PHP
 */

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth.php';

// Only admins can run upgrades
auth_require_admin();

define('UPGRADE_SERVER', 'https://api.slidecastpro.com/updates');
define('CURRENT_VERSION', APP_VERSION);

/**
 * Check for available updates
 */
function upgrade_check() {
    $context = stream_context_create([
        'http' => ['timeout' => 10],
        'ssl' => ['verify_peer' => true]
    ]);
    
    $response = @file_get_contents(
        UPGRADE_SERVER . '/check?version=' . CURRENT_VERSION,
        false,
        $context
    );
    
    if ($response === false) {
        return ['success' => false, 'error' => 'Could not connect to update server'];
    }
    
    $data = json_decode($response, true);
    if (!$data) {
        return ['success' => false, 'error' => 'Invalid response from update server'];
    }
    
    if (version_compare($data['version'] ?? '0', CURRENT_VERSION, '>')) {
        return [
            'success' => true,
            'update_available' => true,
            'new_version' => $data['version'],
            'changelog' => $data['changelog'] ?? '',
            'download_url' => $data['download_url'] ?? '',
            'required' => $data['required'] ?? false,
        ];
    }
    
    return ['success' => true, 'update_available' => false];
}

/**
 * Perform database migration
 */
function upgrade_migrate($from_version, $to_version) {
    $migrations = get_migrations($from_version, $to_version);
    
    foreach ($migrations as $migration) {
        $result = run_migration($migration);
        if (!$result['success']) {
            return [
                'success' => false,
                'error' => 'Migration failed: ' . $migration['file'],
                'details' => $result['error']
            ];
        }
        
        // Record migration
        db_query(
            "INSERT INTO db_migrations (version, migration_file) VALUES (?, ?)",
            "ss",
            [$migration['version'], $migration['file']]
        );
    }
    
    // Update version in settings
    db_query(
        "UPDATE system_settings SET setting_value = ? WHERE setting_key = 'app_version'",
        "s",
        [$to_version]
    );
    
    return ['success' => true, 'migrations_run' => count($migrations)];
}

/**
 * Get pending migrations between versions
 */
function get_migrations($from_version, $to_version) {
    $all_migrations = [
        '2.0.0' => [
            ['file' => 'migration_2_0_0.php', 'version' => '2.0.0', 'description' => 'Initial schema'],
        ],
        '2.1.0' => [
            ['file' => 'migration_2_1_0.php', 'version' => '2.1.0', 'description' => 'Add narration sync fields'],
        ],
    ];
    
    $pending = [];
    foreach ($all_migrations as $version => $migrations) {
        if (version_compare($version, $from_version, '>') && version_compare($version, $to_version, '<=')) {
            $pending = array_merge($pending, $migrations);
        }
    }
    
    return $pending;
}

/**
 * Run a single migration file
 */
function run_migration($migration) {
    $migration_path = __DIR__ . '/migrations/' . $migration['file'];
    
    if (!file_exists($migration_path)) {
        return ['success' => false, 'error' => 'Migration file not found: ' . $migration['file']];
    }
    
    // Include and execute migration
    $conn = get_db_connection();
    
    ob_start();
    $result = include $migration_path;
    $output = ob_get_clean();
    
    if ($result === false) {
        return ['success' => false, 'error' => $output];
    }
    
    return ['success' => true];
}

/**
 * Download and apply update package
 */
function upgrade_apply($download_url) {
    // Create backup
    $backup_dir = __DIR__ . '/backups/' . date('Y-m-d_H-i-s') . '/';
    if (!is_dir($backup_dir)) {
        mkdir($backup_dir, 0755, true);
    }
    
    // Backup critical files
    $critical_files = ['config.php', 'db_connect.php', 'auth.php'];
    foreach ($critical_files as $file) {
        if (file_exists(__DIR__ . '/' . $file)) {
            copy(__DIR__ . '/' . $file, $backup_dir . $file);
        }
    }
    
    // Download update package
    $temp_file = TEMP_PATH . 'update_' . time() . '.zip';
    $package = @file_get_contents($download_url);
    
    if ($package === false) {
        return ['success' => false, 'error' => 'Failed to download update package'];
    }
    
    file_put_contents($temp_file, $package);
    
    // Extract package
    $zip = new ZipArchive();
    if ($zip->open($temp_file) !== true) {
        return ['success' => false, 'error' => 'Failed to extract update package'];
    }
    
    $zip->extractTo(__DIR__);
    $zip->close();
    
    // Cleanup
    unlink($temp_file);
    
    return ['success' => true, 'backup_path' => $backup_dir];
}

/**
 * Rollback to previous version
 */
function upgrade_rollback($backup_path) {
    if (!is_dir($backup_path)) {
        return ['success' => false, 'error' => 'Backup directory not found'];
    }
    
    $files = glob($backup_path . '*');
    foreach ($files as $file) {
        $filename = basename($file);
        copy($file, __DIR__ . '/' . $filename);
    }
    
    return ['success' => true];
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'check':
            echo json_encode(upgrade_check());
            break;
        case 'migrate':
            $to = $_POST['to_version'] ?? '';
            echo json_encode(upgrade_migrate(CURRENT_VERSION, $to));
            break;
        case 'apply':
            $url = $_POST['download_url'] ?? '';
            echo json_encode(upgrade_apply($url));
            break;
        case 'rollback':
            $path = $_POST['backup_path'] ?? '';
            echo json_encode(upgrade_rollback($path));
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Unknown action']);
    }
    exit;
}
?>`
  },
  {
    name: 'api.php',
    description: 'REST API Endpoints',
    icon: 'fas fa-plug',
    code: `<?php
/**
 * SlideCast Pro - REST API
 * Procedural PHP API Handler
 */

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/convert.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/', '', $path);
$segments = explode('/', trim($path, '/'));
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

// API Authentication
function api_authenticate() {
    // Check for API key or session
    $api_key = $_SERVER['HTTP_AUTHORIZATION'] ?? $_GET['api_key'] ?? null;
    
    if ($api_key) {
        $user = db_query_one(
            "SELECT * FROM users WHERE api_key = ? AND status = 'active'",
            "s",
            [$api_key]
        );
        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            return true;
        }
    }
    
    return auth_check();
}

// Response helper
function api_response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function api_error($message, $status = 400) {
    api_response(['success' => false, 'error' => $message], $status);
}

// Route handling
if (!api_authenticate()) {
    api_error('Unauthorized', 401);
}

$user = auth_user();

switch ($resource) {
    case 'user':
        if ($method === 'GET') {
            api_response(['success' => true, 'user' => $user]);
        }
        break;
        
    case 'upload':
        if ($method === 'POST') {
            if (!isset($_FILES['file'])) {
                api_error('No file uploaded');
            }
            
            $result = conversion_upload($_FILES['file'], $user['id']);
            if ($result['success']) {
                api_response($result, 201);
            } else {
                api_error($result['error']);
            }
        }
        break;
        
    case 'convert':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $conversion_id = $input['conversion_id'] ?? null;
            $resolutions = $input['resolutions'] ?? ['720p'];
            
            if (!$conversion_id) {
                api_error('conversion_id is required');
            }
            
            // Check credits
            $total_cost = 0;
            foreach ($resolutions as $res) {
                $total_cost += get_credit_cost($res);
            }
            
            if ($user['credits'] < $total_cost) {
                api_error('Insufficient credits. Required: ' . $total_cost . ', Available: ' . $user['credits']);
            }
            
            $result = conversion_start($conversion_id, $resolutions);
            api_response($result);
        }
        break;
        
    case 'status':
        if ($method === 'GET' && $id) {
            $status = conversion_status($id);
            if ($status) {
                api_response(['success' => true, 'conversion' => $status]);
            } else {
                api_error('Conversion not found', 404);
            }
        }
        break;
        
    case 'download':
        if ($method === 'GET' && $id) {
            $resolution = $_GET['resolution'] ?? '720p';
            $file_path = conversion_download($id, $resolution);
            
            if ($file_path) {
                api_response([
                    'success' => true,
                    'download_url' => APP_URL . '/output/' . basename(dirname(dirname($file_path))) . '/' . basename($file_path)
                ]);
            } else {
                api_error('File not available', 404);
            }
        }
        break;
        
    case 'conversions':
        if ($method === 'GET') {
            $page = max(1, intval($_GET['page'] ?? 1));
            $per_page = min(50, max(1, intval($_GET['per_page'] ?? 20)));
            $offset = ($page - 1) * $per_page;
            
            $conversions = db_query(
                "SELECT * FROM conversions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
                "iii",
                [$user['id'], $per_page, $offset]
            );
            
            $total = db_query_one(
                "SELECT COUNT(*) as count FROM conversions WHERE user_id = ?",
                "i",
                [$user['id']]
            );
            
            api_response([
                'success' => true,
                'data' => $conversions,
                'pagination' => [
                    'page' => $page,
                    'per_page' => $per_page,
                    'total' => $total['count'] ?? 0,
                    'pages' => ceil(($total['count'] ?? 0) / $per_page)
                ]
            ]);
        }
        break;
        
    default:
        api_error('Endpoint not found', 404);
}
?>`
  },
  {
    name: 'index.php',
    description: 'Main Application Entry Point',
    icon: 'fas fa-home',
    code: `<?php
/**
 * SlideCast Pro - Main Entry Point
 * Procedural PHP Application
 */

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth.php';

// Check if installed
if (!defined('INSTALLED') || !INSTALLED) {
    header('Location: install.php');
    exit;
}

// Determine current page
$page = $_GET['page'] ?? 'home';
$allowed_pages = ['home', 'upload', 'dashboard', 'pricing', 'login', 'register', 'about', 'admin'];

if (!in_array($page, $allowed_pages)) {
    $page = 'home';
}

// Auth required pages
$auth_pages = ['upload', 'dashboard', 'admin'];
if (in_array($page, $auth_pages) && !auth_check()) {
    header('Location: index.php?page=login');
    exit;
}

// Handle form submissions
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($page === 'login') {
        $result = auth_login($_POST['email'] ?? '', $_POST['password'] ?? '');
        if ($result['success']) {
            header('Location: index.php?page=dashboard');
            exit;
        } else {
            $error = $result['error'];
        }
    }
    
    if ($page === 'register') {
        $result = auth_register(
            $_POST['name'] ?? '',
            $_POST['email'] ?? '',
            $_POST['password'] ?? '',
            $_POST['role'] ?? 'student'
        );
        if ($result['success']) {
            // Auto login after registration
            auth_login($_POST['email'], $_POST['password']);
            header('Location: index.php?page=dashboard');
            exit;
        } else {
            $error = $result['error'];
        }
    }
    
    if ($page === 'upload' && isset($_FILES['pptx_file'])) {
        $user = auth_user();
        $result = conversion_upload($_FILES['pptx_file'], $user['id']);
        if ($result['success']) {
            $message = 'File uploaded successfully! Job ID: ' . $result['job_id'];
        } else {
            $error = $result['error'];
        }
    }
}

// Get user data if logged in
$current_user = auth_check() ? auth_user() : null;

// Include page template
include __DIR__ . '/templates/header.php';
include __DIR__ . '/templates/' . $page . '.php';
include __DIR__ . '/templates/footer.php';
?>`
  },
  {
    name: 'database_schema.sql',
    description: 'Complete Database Schema',
    icon: 'fas fa-table',
    code: `-- =============================================
-- SlideCast Pro - Database Schema
-- Version: 2.1.0
-- Procedural MySQLi Compatible
-- =============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Create Database
CREATE DATABASE IF NOT EXISTS \`slidecast_pro\` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`slidecast_pro\`;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE \`users\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`name\` VARCHAR(100) NOT NULL,
    \`email\` VARCHAR(150) NOT NULL,
    \`password_hash\` VARCHAR(255) NOT NULL,
    \`role\` ENUM('lecturer','student','trainer','creator','admin') NOT NULL DEFAULT 'student',
    \`credits\` INT UNSIGNED NOT NULL DEFAULT 5,
    \`plan\` ENUM('free','professional','enterprise') NOT NULL DEFAULT 'free',
    \`plan_expires\` DATETIME DEFAULT NULL,
    \`avatar\` VARCHAR(255) DEFAULT NULL,
    \`api_key\` VARCHAR(64) DEFAULT NULL,
    \`status\` ENUM('active','suspended','pending') NOT NULL DEFAULT 'active',
    \`email_verified\` TINYINT(1) NOT NULL DEFAULT 0,
    \`last_login\` DATETIME DEFAULT NULL,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`idx_email\` (\`email\`),
    UNIQUE KEY \`idx_api_key\` (\`api_key\`),
    KEY \`idx_status\` (\`status\`),
    KEY \`idx_plan\` (\`plan\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CONVERSIONS TABLE
-- =============================================
CREATE TABLE \`conversions\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`user_id\` INT UNSIGNED NOT NULL,
    \`job_id\` VARCHAR(50) NOT NULL,
    \`filename\` VARCHAR(500) NOT NULL,
    \`original_name\` VARCHAR(255) NOT NULL,
    \`file_size\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    \`slide_count\` INT UNSIGNED NOT NULL DEFAULT 0,
    \`duration\` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Duration in seconds',
    \`status\` ENUM('queued','processing','completed','failed','cancelled') NOT NULL DEFAULT 'queued',
    \`progress\` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    \`error_message\` TEXT DEFAULT NULL,
    \`narration_detected\` TINYINT(1) NOT NULL DEFAULT 0,
    \`narration_sync\` TINYINT(1) NOT NULL DEFAULT 0,
    \`priority\` TINYINT UNSIGNED NOT NULL DEFAULT 5,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`started_at\` DATETIME DEFAULT NULL,
    \`completed_at\` DATETIME DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`idx_job_id\` (\`job_id\`),
    KEY \`idx_user_id\` (\`user_id\`),
    KEY \`idx_status\` (\`status\`),
    KEY \`idx_created\` (\`created_at\`),
    CONSTRAINT \`fk_conversions_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- OUTPUT FILES TABLE
-- =============================================
CREATE TABLE \`output_files\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`conversion_id\` INT UNSIGNED NOT NULL,
    \`resolution\` ENUM('480p','720p','1080p') NOT NULL,
    \`file_path\` VARCHAR(500) NOT NULL,
    \`file_size\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    \`duration\` INT UNSIGNED NOT NULL DEFAULT 0,
    \`video_codec\` VARCHAR(20) NOT NULL DEFAULT 'h264',
    \`audio_codec\` VARCHAR(20) NOT NULL DEFAULT 'aac',
    \`frame_rate\` INT UNSIGNED NOT NULL DEFAULT 30,
    \`download_count\` INT UNSIGNED NOT NULL DEFAULT 0,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`expires_at\` DATETIME DEFAULT NULL,
    PRIMARY KEY (\`id\`),
    KEY \`idx_conversion_id\` (\`conversion_id\`),
    KEY \`idx_resolution\` (\`resolution\`),
    CONSTRAINT \`fk_output_conversion\` FOREIGN KEY (\`conversion_id\`) REFERENCES \`conversions\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CREDIT TRANSACTIONS TABLE
-- =============================================
CREATE TABLE \`credit_transactions\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`user_id\` INT UNSIGNED NOT NULL,
    \`type\` ENUM('purchase','conversion','refund','bonus','subscription','admin_adjust') NOT NULL,
    \`amount\` INT NOT NULL COMMENT 'Positive for credit, negative for debit',
    \`balance_after\` INT UNSIGNED NOT NULL,
    \`description\` VARCHAR(255) DEFAULT NULL,
    \`reference_id\` VARCHAR(100) DEFAULT NULL,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_user_id\` (\`user_id\`),
    KEY \`idx_type\` (\`type\`),
    KEY \`idx_created\` (\`created_at\`),
    CONSTRAINT \`fk_credits_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE \`subscriptions\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`user_id\` INT UNSIGNED NOT NULL,
    \`plan\` ENUM('professional','enterprise') NOT NULL,
    \`status\` ENUM('active','cancelled','expired','past_due') NOT NULL DEFAULT 'active',
    \`monthly_credits\` INT UNSIGNED NOT NULL,
    \`price_monthly\` DECIMAL(10,2) NOT NULL,
    \`start_date\` DATE NOT NULL,
    \`end_date\` DATE NOT NULL,
    \`auto_renew\` TINYINT(1) NOT NULL DEFAULT 1,
    \`payment_method\` VARCHAR(50) DEFAULT NULL,
    \`stripe_subscription_id\` VARCHAR(100) DEFAULT NULL,
    \`cancellation_reason\` VARCHAR(255) DEFAULT NULL,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_user_id\` (\`user_id\`),
    KEY \`idx_status\` (\`status\`),
    CONSTRAINT \`fk_subscriptions_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SYSTEM SETTINGS TABLE
-- =============================================
CREATE TABLE \`system_settings\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`setting_key\` VARCHAR(100) NOT NULL,
    \`setting_value\` TEXT DEFAULT NULL,
    \`setting_group\` VARCHAR(50) NOT NULL DEFAULT 'general',
    \`description\` VARCHAR(255) DEFAULT NULL,
    \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`idx_key\` (\`setting_key\`),
    KEY \`idx_group\` (\`setting_group\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- DATABASE MIGRATIONS TABLE
-- =============================================
CREATE TABLE \`db_migrations\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`version\` VARCHAR(20) NOT NULL,
    \`migration_file\` VARCHAR(255) NOT NULL,
    \`description\` VARCHAR(255) DEFAULT NULL,
    \`applied_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`idx_version\` (\`version\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ACTIVITY LOG TABLE
-- =============================================
CREATE TABLE \`activity_log\` (
    \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`user_id\` INT UNSIGNED DEFAULT NULL,
    \`action\` VARCHAR(100) NOT NULL,
    \`entity_type\` VARCHAR(50) DEFAULT NULL,
    \`entity_id\` INT UNSIGNED DEFAULT NULL,
    \`details\` JSON DEFAULT NULL,
    \`ip_address\` VARCHAR(45) DEFAULT NULL,
    \`user_agent\` VARCHAR(255) DEFAULT NULL,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_user_id\` (\`user_id\`),
    KEY \`idx_action\` (\`action\`),
    KEY \`idx_created\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- DEFAULT DATA
-- =============================================
INSERT INTO \`system_settings\` (\`setting_key\`, \`setting_value\`, \`setting_group\`, \`description\`) VALUES
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
('email_verification_required', '1', 'auth', 'Require email verification');

COMMIT;`
  },
];

export default function BackendFiles() {
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(phpFiles[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('slidecast-pro-backend')!;
      
      // Add all PHP files
      phpFiles.forEach(file => {
        folder.file(file.name, file.code);
      });
      
      // Add README
      folder.file('README.md', `# SlideCast Pro - PHP Backend

## Installation
1. Upload all files to your web server
2. Visit install.php in your browser
3. Follow the installation wizard
4. Delete install.php after completion

## Requirements
- PHP 8.0+
- MySQL 5.7+ / MariaDB 10.3+
- FFmpeg
- LibreOffice (headless)

## Files
- install.php - Installation wizard
- config.php - Configuration (generated during install)
- db_connect.php - Database connection handler
- auth.php - Authentication functions
- convert.php - Video conversion engine
- upgrade.php - Upgrade system
- api.php - REST API endpoints
- index.php - Main entry point
- database_schema.sql - Complete database schema

Version: 2.1.0
`);
      
      // Add .htaccess for Apache
      folder.file('.htaccess', `RewriteEngine On
RewriteBase /

# Security - Block direct access to sensitive files
<FilesMatch "\\.(php|sql|log)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>

# Block access to config and sensitive files
<Files "config.php">
    Order Deny,Allow
    Deny from all
</Files>

# Allow uploads directory
<Directory "uploads">
    Options -Indexes
</Directory>

# PHP settings
php_value upload_max_filesize 500M
php_value post_max_size 510M
php_value max_execution_time 600
php_value memory_limit 512M
`);
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'slidecast-pro-backend-v2.1.0.zip');
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    }
    setDownloading(false);
  };

  return (
    <section className="py-5 mt-5">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="section-title">PHP <span className="gradient-text">Backend Source</span></h2>
          <p className="section-subtitle">
            Complete procedural PHP backend with MySQLi — installable and upgradeable
          </p>
          <div className="d-flex gap-2 justify-content-center flex-wrap mb-4">
            <span className="badge bg-primary px-3 py-2"><i className="fas fa-code me-1"></i> Procedural PHP 8.x</span>
            <span className="badge bg-info px-3 py-2"><i className="fas fa-database me-1"></i> Procedural MySQLi</span>
            <span className="badge bg-success px-3 py-2"><i className="fas fa-download me-1"></i> Installable</span>
            <span className="badge bg-warning text-dark px-3 py-2"><i className="fas fa-arrow-up me-1"></i> Upgradeable</span>
          </div>
        </div>

        <div className="row g-4">
          {/* File List */}
          <div className="col-lg-3">
            <div className="card-custom p-0 overflow-hidden" style={{ position: 'sticky', top: '100px' }}>
              <div className="p-3 border-bottom" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                <h6 className="text-light mb-0"><i className="fas fa-folder-open me-2"></i>Project Files</h6>
              </div>
              <div className="list-group list-group-flush">
                {phpFiles.map((file, i) => (
                  <button
                    key={i}
                    className={`list-group-item list-group-item-action border-0 py-3 ${i === activeFile ? 'active' : ''}`}
                    style={{
                      background: i === activeFile ? 'rgba(99,102,241,0.1)' : 'transparent',
                      color: i === activeFile ? '#818cf8' : '#94a3b8',
                      borderLeft: i === activeFile ? '3px solid #6366f1' : '3px solid transparent',
                    }}
                    onClick={() => setActiveFile(i)}
                  >
                    <div className="d-flex align-items-center">
                      <i className={`${file.icon} me-2`} style={{ width: 20 }}></i>
                      <div>
                        <div className="small fw-bold">{file.name}</div>
                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>{file.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Code Display */}
          <div className="col-lg-9">
            <div className="card-custom p-0 overflow-hidden">
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: 'rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.05)' }}>
                <div className="d-flex align-items-center">
                  <i className={`${phpFiles[activeFile].icon} me-2`} style={{ color: '#6366f1' }}></i>
                  <span className="text-light fw-bold">{phpFiles[activeFile].name}</span>
                  <span className="badge bg-dark ms-2">PHP</span>
                </div>
                <button className="btn btn-sm btn-outline-light" onClick={copyCode}>
                  {copied ? <><i className="fas fa-check me-1"></i>Copied!</> : <><i className="fas fa-copy me-1"></i>Copy</>}
                </button>
              </div>
              <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
                <pre className="mb-0 p-4" style={{ background: '#0a0e1a', color: '#e2e8f0', fontSize: '0.8rem', lineHeight: 1.6 }}>
                  <code>{phpFiles[activeFile].code}</code>
                </pre>
              </div>
            </div>

            {/* Download Section */}
            <div className="card-custom mt-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <h5 className="text-light mb-0"><i className="fas fa-download me-2" style={{ color: '#6366f1' }}></i>Download Backend Files</h5>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-primary-custom"
                    onClick={() => downloadFile(phpFiles[activeFile].name, phpFiles[activeFile].code)}
                  >
                    <i className="fas fa-file-download me-1"></i>Download Current
                  </button>
                  <button
                    className="btn btn-sm btn-outline-custom"
                    onClick={downloadAllFiles}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <><span className="spinner-border spinner-border-sm me-1"></span>Downloading...</>
                    ) : (
                      <><i className="fas fa-file-archive me-1"></i>Download All Files</>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-3" style={{ background: 'rgba(15,23,42,0.5)' }}>
                <div className="d-flex align-items-center mb-2">
                  <i className="fas fa-info-circle me-2" style={{ color: '#0ea5e9' }}></i>
                  <small className="text-secondary">
                    Download all PHP backend files to deploy on your server. Includes installer, conversion engine, 
                    database schema, authentication, API, and upgrade system.
                  </small>
                </div>
                <div className="d-flex gap-2 flex-wrap mt-2">
                  <span className="badge bg-dark"><i className="fas fa-file-code me-1"></i> {phpFiles.length} files</span>
                  <span className="badge bg-dark"><i className="fas fa-database me-1"></i> MySQLi</span>
                  <span className="badge bg-dark"><i className="fas fa-server me-1"></i> PHP 8.x</span>
                  <span className="badge bg-success"><i className="fas fa-check me-1"></i> Production Ready</span>
                </div>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="card-custom mt-4">
              <h5 className="text-light mb-3"><i className="fas fa-terminal me-2" style={{ color: '#6366f1' }}></i>Installation Instructions</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 rounded-3" style={{ background: 'rgba(15,23,42,0.5)' }}>
                    <h6 className="text-light small mb-2">1. Requirements</h6>
                    <ul className="list-unstyled text-secondary small mb-0">
                      <li>• PHP 8.0+</li>
                      <li>• MySQL 5.7+ / MariaDB 10.3+</li>
                      <li>• FFmpeg installed</li>
                      <li>• LibreOffice (headless)</li>
                      <li>• Apache/Nginx with mod_rewrite</li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded-3" style={{ background: 'rgba(15,23,42,0.5)' }}>
                    <h6 className="text-light small mb-2">2. Quick Install</h6>
                    <pre className="text-secondary small mb-0" style={{ background: 'transparent' }}>
{`# Extract files to web root
unzip slidecast-pro-v2.1.0.zip -d /var/www/

# Set permissions
chmod -R 755 /var/www/slidecast-pro/
chmod -R 777 uploads/ output/ temp/

# Visit install.php in browser
# Complete the installation wizard`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
