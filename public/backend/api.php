<?php
/**
 * SlideCast Pro - REST API
 * Procedural PHP API Handler
 */

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/convert.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('/^.*\/api\//', '', $path);
$segments = explode('/', trim($path, '/'));
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

// API Authentication
function api_authenticate() {
    $api_key = $_SERVER['HTTP_X_API_KEY'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_GET['api_key'] ?? null;
    
    if ($api_key) {
        // Remove "Bearer " prefix if present
        $api_key = str_replace('Bearer ', '', $api_key);
        
        $user = db_query_one(
            "SELECT * FROM users WHERE api_key = ? AND status = 'active'",
            "s",
            [$api_key]
        );
        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_credits'] = $user['credits'];
            $_SESSION['user_plan'] = $user['plan'];
            $_SESSION['logged_in'] = true;
            return true;
        }
    }
    
    return auth_check();
}

// Response helpers
function api_response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}

function api_error($message, $status = 400) {
    api_response(['success' => false, 'error' => $message], $status);
}

// Authenticate
if (!api_authenticate()) {
    api_error('Unauthorized. Provide valid API key or session.', 401);
}

$user = auth_user();

// Route handling
switch ($resource) {
    case '':
    case 'health':
        api_response([
            'success' => true,
            'app' => APP_NAME,
            'version' => APP_VERSION,
            'status' => 'healthy',
            'timestamp' => date('c')
        ]);
        break;
        
    case 'me':
    case 'user':
        if ($method === 'GET') {
            api_response(['success' => true, 'user' => $user]);
        } elseif ($method === 'PUT') {
            $input = json_decode(file_get_contents('php://input'), true);
            // Update user profile
            if (isset($input['name'])) {
                db_query("UPDATE users SET name = ? WHERE id = ?", "si", [$input['name'], $user['id']]);
            }
            api_response(['success' => true, 'message' => 'Profile updated']);
        }
        break;
        
    case 'upload':
        if ($method === 'POST') {
            if (!isset($_FILES['file'])) {
                api_error('No file uploaded. Use multipart/form-data with field "file".');
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
            
            // Validate resolutions
            $valid_res = ['480p', '720p', '1080p'];
            $resolutions = array_intersect($resolutions, $valid_res);
            if (empty($resolutions)) {
                api_error('At least one valid resolution required (480p, 720p, 1080p)');
            }
            
            // Check credits
            $total_cost = 0;
            foreach ($resolutions as $res) {
                $total_cost += get_credit_cost($res);
            }
            
            if ($user['credits'] < $total_cost) {
                api_error('Insufficient credits. Required: ' . $total_cost . ', Available: ' . $user['credits'], 402);
            }
            
            $result = conversion_start($conversion_id, $resolutions, $user['id']);
            api_response($result);
        }
        break;
        
    case 'status':
        if ($method === 'GET' && $id) {
            $status = conversion_status($id, $user['id']);
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
            $file_info = conversion_download($id, $resolution, $user['id']);
            
            if ($file_info) {
                api_response([
                    'success' => true,
                    'download_url' => APP_URL . '/output/' . basename(dirname($file_info['file_path'])) . '/' . basename($file_info['file_path']),
                    'file_size' => $file_info['file_size'],
                    'resolution' => $resolution
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
            
            $history = conversion_history($user['id'], $page, $per_page);
            
            api_response([
                'success' => true,
                'data' => $history['data'],
                'pagination' => [
                    'page' => $history['page'],
                    'per_page' => $history['per_page'],
                    'total' => $history['total'],
                    'pages' => $history['pages']
                ]
            ]);
        }
        break;
        
    case 'credits':
        if ($method === 'GET') {
            $transactions = db_query(
                "SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
                "i",
                [$user['id']]
            );
            
            api_response([
                'success' => true,
                'balance' => $user['credits'],
                'transactions' => $transactions ?: []
            ]);
        }
        break;
        
    default:
        api_error('Endpoint not found: ' . $resource, 404);
}
?>
