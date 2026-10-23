<?php
/**
 * SlideCast Pro - Authentication Functions
 * Procedural PHP Authentication Handler
 */

require_once __DIR__ . '/db_connect.php';

/**
 * Register a new user
 */
function auth_register($name, $email, $password, $role = 'student') {
    if (empty($name) || empty($email) || empty($password)) {
        return ['success' => false, 'error' => 'All fields are required'];
    }
    
    if (strlen($password) < 8) {
        return ['success' => false, 'error' => 'Password must be at least 8 characters'];
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'error' => 'Invalid email address'];
    }
    
    $existing = db_query_one("SELECT id FROM users WHERE email = ?", "s", [$email]);
    if ($existing) {
        return ['success' => false, 'error' => 'Email already registered'];
    }
    
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $initial_credits = in_array($role, ['lecturer', 'trainer']) ? 10 : 5;
    
    $result = db_query(
        "INSERT INTO users (name, email, password_hash, role, credits, plan) VALUES (?, ?, ?, ?, ?, 'free')",
        "ssssi",
        [$name, $email, $hash, $role, $initial_credits]
    );
    
    if ($result && $result['insert_id']) {
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
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_credits'] = $user['credits'];
    $_SESSION['user_plan'] = $user['plan'];
    $_SESSION['logged_in'] = true;
    
    session_regenerate_id(true);
    
    // Update last login
    db_query("UPDATE users SET last_login = NOW() WHERE id = ?", "i", [$user['id']]);
    
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
    
    // Refresh from database
    $user = db_query_one(
        "SELECT id, name, email, role, credits, plan FROM users WHERE id = ? AND status = 'active'",
        "i",
        [$_SESSION['user_id'] ?? 0]
    );
    
    if ($user) {
        $_SESSION['user_credits'] = $user['credits'];
        return $user;
    }
    
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
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
}

/**
 * Require authentication
 */
function auth_require() {
    if (!auth_check()) {
        header('Location: index.php?page=login');
        exit;
    }
}

/**
 * Require admin role
 */
function auth_require_admin() {
    auth_require();
    if (($_SESSION['user_role'] ?? '') !== 'admin') {
        http_response_code(403);
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
    
    if ($result && isset($_SESSION['user_id']) && $_SESSION['user_id'] == $user_id) {
        $_SESSION['user_credits'] = $new_credits;
    }
    
    return $result !== false;
}

/**
 * Generate API key for user
 */
function auth_generate_api_key($user_id) {
    $key = bin2hex(random_bytes(32));
    db_query("UPDATE users SET api_key = ? WHERE id = ?", "si", [$key, $user_id]);
    return $key;
}
?>
