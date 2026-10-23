<?php
/**
 * SlideCast Pro - Main Entry Point
 * Procedural PHP Application
 */

// Check if installed
if (!file_exists(__DIR__ . '/config.php')) {
    header('Location: install.php');
    exit;
}

require_once __DIR__ . '/config.php';

if (!defined('INSTALLED') || !INSTALLED) {
    header('Location: install.php');
    exit;
}

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth.php';

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
            auth_login($_POST['email'], $_POST['password']);
            header('Location: index.php?page=dashboard');
            exit;
        } else {
            $error = $result['error'];
        }
    }
    
    if ($page === 'upload' && isset($_FILES['pptx_file'])) {
        require_once __DIR__ . '/convert.php';
        $user = auth_user();
        $result = conversion_upload($_FILES['pptx_file'], $user['id']);
        if ($result['success']) {
            $message = 'File uploaded successfully! Job ID: ' . $result['job_id'];
        } else {
            $error = $result['error'];
        }
    }
    
    if ($page === 'logout') {
        auth_logout();
        header('Location: index.php');
        exit;
    }
}

// Get user data
$current_user = auth_check() ? auth_user() : null;

// Simple page rendering
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo APP_NAME; ?> - PPTX to MP4 Conversion</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    <style>
        body { background: linear-gradient(135deg, #020617 0%, #0f172a 100%); min-height: 100vh; color: #e2e8f0; font-family: 'Inter', sans-serif; }
        .card-dark { background: rgba(15,23,42,0.9); border: 1px solid rgba(99,102,241,0.2); border-radius: 16px; }
        .btn-primary-custom { background: linear-gradient(135deg, #6366f1, #4f46e5); border: none; color: white; border-radius: 10px; }
        .btn-primary-custom:hover { background: linear-gradient(135deg, #818cf8, #6366f1); color: white; }
    </style>
</head>
<body>
    <nav class="navbar navbar-dark py-3" style="background: rgba(15,23,42,0.95); border-bottom: 1px solid rgba(99,102,241,0.1);">
        <div class="container">
            <a class="navbar-brand fw-bold" href="index.php" style="color: #818cf8;">
                <i class="fas fa-film me-2"></i><?php echo APP_NAME; ?>
            </a>
            <div class="d-flex gap-3">
                <?php if ($current_user): ?>
                    <span class="text-light small"><i class="fas fa-coins text-warning me-1"></i><?php echo $current_user['credits']; ?> credits</span>
                    <a href="index.php?page=dashboard" class="btn btn-sm btn-outline-light rounded-pill">Dashboard</a>
                    <a href="index.php?page=logout" class="btn btn-sm btn-outline-danger rounded-pill">Logout</a>
                <?php else: ?>
                    <a href="index.php?page=login" class="btn btn-sm btn-outline-light rounded-pill">Login</a>
                    <a href="index.php?page=register" class="btn btn-sm btn-primary-custom rounded-pill">Sign Up</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>

    <div class="container py-5">
        <?php if ($error): ?>
        <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        <?php if ($message): ?>
        <div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>

        <?php if ($page === 'home'): ?>
        <div class="text-center py-5">
            <h1 class="display-4 fw-bold mb-3">Transform Presentations into <span style="color: #818cf8;">Videos</span></h1>
            <p class="lead text-secondary mb-4">Upload PPTX files with narration, render to MP4 in 480p, 720p, or 1080p</p>
            <a href="index.php?page=<?php echo $current_user ? 'upload' : 'register'; ?>" class="btn btn-primary-custom btn-lg px-5">
                <i class="fas fa-rocket me-2"></i>Get Started
            </a>
        </div>

        <?php elseif ($page === 'login'): ?>
        <div class="row justify-content-center">
            <div class="col-md-5">
                <div class="card-dark p-4">
                    <h3 class="text-light text-center mb-4">Login</h3>
                    <form method="POST">
                        <div class="mb-3">
                            <label class="form-label text-secondary small">Email</label>
                            <input type="email" name="email" class="form-control" style="background:rgba(15,23,42,0.8);border:1px solid rgba(99,102,241,0.2);color:#e2e8f0;" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-secondary small">Password</label>
                            <input type="password" name="password" class="form-control" style="background:rgba(15,23,42,0.8);border:1px solid rgba(99,102,241,0.2);color:#e2e8f0;" required>
                        </div>
                        <button type="submit" class="btn btn-primary-custom w-100">Login</button>
                    </form>
                    <p class="text-center mt-3 small text-secondary">No account? <a href="index.php?page=register" style="color:#818cf8;">Sign up</a></p>
                </div>
            </div>
        </div>

        <?php elseif ($page === 'register'): ?>
        <div class="row justify-content-center">
            <div class="col-md-5">
                <div class="card-dark p-4">
                    <h3 class="text-light text-center mb-4">Create Account</h3>
                    <form method="POST">
                        <div class="mb-3">
                            <label class="form-label text-secondary small">Name</label>
                            <input type="text" name="name" class="form-control" style="background:rgba(15,23,42,0.8);border:1px solid rgba(99,102,241,0.2);color:#e2e8f0;" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-secondary small">Email</label>
                            <input type="email" name="email" class="form-control" style="background:rgba(15,23,42,0.8);border:1px solid rgba(99,102,241,0.2);color:#e2e8f0;" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-secondary small">Role</label>
                            <select name="role" class="form-control" style="background:rgba(15,23,42,0.8);border:1px solid rgba(99,102,241,0.2);color:#e2e8f0;">
                                <option value="student">Student</option>
                                <option value="lecturer">Lecturer</option>
                                <option value="trainer">Trainer</option>
                                <option value="creator">Content Creator</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-secondary small">Password (min 8 chars)</label>
                            <input type="password" name="password" class="form-control" minlength="8" style="background:rgba(15,23,42,0.8);border:1px solid rgba(99,102,241,0.2);color:#e2e8f0;" required>
                        </div>
                        <button type="submit" class="btn btn-primary-custom w-100">Create Account</button>
                    </form>
                    <p class="text-center mt-3 small text-secondary">Have an account? <a href="index.php?page=login" style="color:#818cf8;">Login</a></p>
                </div>
            </div>
        </div>

        <?php elseif ($page === 'dashboard' && $current_user): ?>
        <h2 class="text-light mb-4">Welcome, <?php echo htmlspecialchars($current_user['name']); ?></h2>
        <div class="row g-4 mb-4">
            <div class="col-md-3">
                <div class="card-dark p-3 text-center">
                    <div class="fs-2 fw-bold" style="color:#6366f1;"><?php echo $current_user['credits']; ?></div>
                    <small class="text-secondary">Credits</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card-dark p-3 text-center">
                    <div class="fs-2 fw-bold" style="color:#10b981;"><?php echo ucfirst($current_user['plan']); ?></div>
                    <small class="text-secondary">Plan</small>
                </div>
            </div>
        </div>
        <a href="index.php?page=upload" class="btn btn-primary-custom"><i class="fas fa-plus me-2"></i>New Conversion</a>

        <?php elseif ($page === 'upload' && $current_user): ?>
        <h2 class="text-light mb-4">Convert PPTX to MP4</h2>
        <div class="card-dark p-4">
            <form method="POST" enctype="multipart/form-data">
                <div class="mb-3">
                    <label class="form-label text-secondary">Select PPTX File</label>
                    <input type="file" name="pptx_file" class="form-control" accept=".pptx" required style="background:rgba(15,23,42,0.8);border:1px solid rgba(99,102,241,0.2);color:#e2e8f0;">
                </div>
                <button type="submit" class="btn btn-primary-custom"><i class="fas fa-upload me-2"></i>Upload & Convert</button>
            </form>
        </div>

        <?php endif; ?>
    </div>

    <footer class="text-center py-4 text-secondary small" style="border-top: 1px solid rgba(99,102,241,0.1);">
        © 2026 <?php echo APP_NAME; ?> v<?php echo APP_VERSION; ?>. Installable & Upgradeable.
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
