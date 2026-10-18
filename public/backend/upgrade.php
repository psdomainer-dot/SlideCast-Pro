<?php
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
        
        db_query(
            "INSERT INTO db_migrations (version, migration_file, description) VALUES (?, ?, ?)",
            "sss",
            [$migration['version'], $migration['file'], $migration['description'] ?? '']
        );
    }
    
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
            ['file' => 'migration_2_0_0.sql', 'version' => '2.0.0', 'description' => 'Initial schema'],
        ],
        '2.1.0' => [
            ['file' => 'migration_2_1_0.sql', 'version' => '2.1.0', 'description' => 'Add narration sync fields'],
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
    
    $conn = get_db_connection();
    $sql = file_get_contents($migration_path);
    
    $result = mysqli_multi_query($conn, $sql);
    if (!$result) {
        return ['success' => false, 'error' => mysqli_error($conn)];
    }
    
    // Consume all results
    do {
        if ($result = mysqli_store_result($conn)) {
            mysqli_free_result($result);
        }
    } while (mysqli_next_result($conn));
    
    return ['success' => true];
}

/**
 * Download and apply update package
 */
function upgrade_apply($download_url) {
    $backup_dir = __DIR__ . '/backups/' . date('Y-m-d_H-i-s') . '/';
    if (!is_dir($backup_dir)) {
        mkdir($backup_dir, 0755, true);
    }
    
    // Backup critical files
    $critical_files = ['config.php', 'db_connect.php', 'auth.php', 'convert.php', 'index.php'];
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
    
    // Extract
    $zip = new ZipArchive();
    if ($zip->open($temp_file) !== true) {
        return ['success' => false, 'error' => 'Failed to extract update package'];
    }
    
    $zip->extractTo(__DIR__);
    $zip->close();
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
        if (is_file($file)) {
            $filename = basename($file);
            copy($file, __DIR__ . '/' . $filename);
        }
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

// Display upgrade page
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Upgrade - <?php echo APP_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-light">
    <div class="container py-5">
        <h2>System Upgrade</h2>
        <p>Current version: <strong><?php echo CURRENT_VERSION; ?></strong></p>
        <button id="checkBtn" class="btn btn-primary">Check for Updates</button>
        <div id="result" class="mt-3"></div>
    </div>
    <script>
    document.getElementById('checkBtn').addEventListener('click', function() {
        fetch('upgrade.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'action=check'
        })
        .then(r => r.json())
        .then(data => {
            const el = document.getElementById('result');
            if (data.update_available) {
                el.innerHTML = '<div class="alert alert-info">Update available: v' + data.new_version + '<br>' + data.changelog + '</div>';
            } else {
                el.innerHTML = '<div class="alert alert-success">You are up to date!</div>';
            }
        });
    });
    </script>
</body>
</html>
