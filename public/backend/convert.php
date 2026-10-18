<?php
/**
 * SlideCast Pro - Conversion Engine
 * Handles PPTX to MP4 conversion with narration sync
 * Procedural PHP with MySQLi
 */

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth.php';

/**
 * Process uploaded PPTX file
 */
function conversion_upload($file, $user_id) {
    $allowed = ['pptx'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($ext, $allowed)) {
        return ['success' => false, 'error' => 'Only .pptx files are accepted.'];
    }
    
    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return ['success' => false, 'error' => 'File exceeds maximum size of 500MB.'];
    }
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $upload_errors = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        ];
        return ['success' => false, 'error' => $upload_errors[$file['error']] ?? 'Unknown upload error'];
    }
    
    // Generate unique job ID
    $job_id = 'JOB-' . strtoupper(bin2hex(random_bytes(6)));
    
    // Create directories
    $upload_dir = UPLOAD_PATH . $job_id . '/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Move uploaded file
    $dest_path = $upload_dir . basename($file['name']);
    if (!move_uploaded_file($file['tmp_name'], $dest_path)) {
        return ['success' => false, 'error' => 'Failed to save uploaded file.'];
    }
    
    // Analyze PPTX
    $analysis = analyze_pptx($dest_path);
    
    // Create conversion record
    $result = db_query(
        "INSERT INTO conversions (user_id, job_id, filename, original_name, file_size, slide_count, narration_detected, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'queued')",
        "isssiii",
        [$user_id, $job_id, $dest_path, $file['name'], $file['size'], $analysis['slide_count'], $analysis['has_narration'] ? 1 : 0]
    );
    
    if (!$result) {
        return ['success' => false, 'error' => 'Failed to create conversion record.'];
    }
    
    // Log activity
    log_activity($user_id, 'upload', 'conversion', $result['insert_id'], ['job_id' => $job_id]);
    
    return [
        'success' => true,
        'job_id' => $job_id,
        'conversion_id' => $result['insert_id'],
        'slide_count' => $analysis['slide_count'],
        'has_narration' => $analysis['has_narration'],
        'estimated_time' => estimate_conversion_time($analysis['slide_count']),
    ];
}

/**
 * Analyze PPTX file structure
 */
function analyze_pptx($filepath) {
    $result = ['slide_count' => 0, 'has_narration' => false, 'media_files' => 0, 'duration' => 0];
    
    if (!class_exists('ZipArchive')) {
        return $result;
    }
    
    $zip = new ZipArchive();
    if ($zip->open($filepath) === true) {
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            
            // Count slides
            if (preg_match('/^ppt\/slides\/slide(\d+)\.xml$/', $name, $matches)) {
                $result['slide_count']++;
            }
            
            // Check for narration audio
            if (preg_match('/^ppt\/media\/.*\.(mp3|wav|m4a|wma)$/i', $name)) {
                $result['has_narration'] = true;
                $result['media_files']++;
            }
            
            // Count images
            if (preg_match('/^ppt\/media\/.*\.(png|jpg|jpeg|gif|svg)$/i', $name)) {
                $result['media_files']++;
            }
        }
        
        // Try to get timing from slide XML
        if ($result['slide_count'] > 0) {
            $slide_xml = $zip->getFromName('ppt/slides/slide1.xml');
            if ($slide_xml) {
                // Look for timing information
                if (preg_match('/<p:seq.*?dur="(\d+)"/', $slide_xml, $matches)) {
                    $result['duration'] = intval($matches[1]) / 1000; // Convert ms to seconds
                }
            }
        }
        
        $zip->close();
    }
    
    // Estimate duration if not found
    if ($result['duration'] === 0 && $result['slide_count'] > 0) {
        $result['duration'] = $result['slide_count'] * 5; // 5 seconds per slide default
    }
    
    return $result;
}

/**
 * Estimate conversion time
 */
function estimate_conversion_time($slide_count) {
    // Rough estimate: ~2 seconds per slide for processing
    return max(30, $slide_count * 2);
}

/**
 * Start conversion process
 */
function conversion_start($conversion_id, $resolutions, $user_id) {
    $conversion = db_query_one(
        "SELECT * FROM conversions WHERE id = ? AND user_id = ?",
        "ii",
        [$conversion_id, $user_id]
    );
    
    if (!$conversion) {
        return ['success' => false, 'error' => 'Conversion not found.'];
    }
    
    if ($conversion['status'] !== 'queued') {
        return ['success' => false, 'error' => 'Conversion already started or completed.'];
    }
    
    // Calculate total credit cost
    $total_cost = 0;
    foreach ($resolutions as $res) {
        $total_cost += get_credit_cost($res);
    }
    
    // Check user credits
    $user = db_query_one("SELECT credits FROM users WHERE id = ?", "i", [$user_id]);
    if (!$user || $user['credits'] < $total_cost) {
        return ['success' => false, 'error' => 'Insufficient credits. Need ' . $total_cost . ', have ' . ($user['credits'] ?? 0)];
    }
    
    // Update status
    db_query(
        "UPDATE conversions SET status = 'processing', started_at = NOW(), progress = 0 WHERE id = ?",
        "i",
        [$conversion_id]
    );
    
    // Process each resolution
    $results = [];
    foreach ($resolutions as $resolution) {
        $credit_cost = get_credit_cost($resolution);
        $output_dir = OUTPUT_PATH . $conversion['job_id'] . '/' . $resolution . '/';
        
        if (!is_dir($output_dir)) {
            mkdir($output_dir, 0755, true);
        }
        
        $output_filename = pathinfo($conversion['original_name'], PATHINFO_FILENAME) . '_' . $resolution . '.mp4';
        $output_path = $output_dir . $output_filename;
        
        // Render video
        $render_result = render_video($conversion, $resolution, $output_path);
        
        if ($render_result['success']) {
            $file_size = file_exists($output_path) ? filesize($output_path) : 0;
            
            db_query(
                "INSERT INTO output_files (conversion_id, resolution, file_path, file_size, duration) VALUES (?, ?, ?, ?, ?)",
                "issii",
                [$conversion_id, $resolution, $output_path, $file_size, $render_result['duration']]
            );
            
            // Deduct credits
            deduct_credits($user_id, $credit_cost, "Conversion {$conversion['job_id']} to {$resolution}");
            
            $results[$resolution] = ['success' => true, 'file_size' => $file_size];
        } else {
            $results[$resolution] = ['success' => false, 'error' => $render_result['error']];
        }
        
        // Update progress
        $idx = array_search($resolution, $resolutions);
        $progress = round((($idx !== false ? $idx : 0) + 1) / count($resolutions) * 100);
        db_query("UPDATE conversions SET progress = ? WHERE id = ?", "ii", [$progress, $conversion_id]);
    }
    
    // Mark as completed
    $all_success = !in_array(false, array_column($results, 'success'));
    $final_status = $all_success ? 'completed' : 'failed';
    
    db_query(
        "UPDATE conversions SET status = ?, progress = 100, completed_at = NOW() WHERE id = ?",
        "si",
        [$final_status, $conversion_id]
    );
    
    log_activity($user_id, 'conversion_complete', 'conversion', $conversion_id, ['resolutions' => $resolutions, 'status' => $final_status]);
    
    return ['success' => true, 'results' => $results, 'status' => $final_status];
}

/**
 * Render video from PPTX using FFmpeg
 */
function render_video($conversion, $resolution, $output_path) {
    $pptx_path = $conversion['filename'];
    $temp_dir = TEMP_PATH . $conversion['job_id'] . '_' . $resolution . '/';
    
    if (!is_dir($temp_dir)) {
        mkdir($temp_dir, 0755, true);
    }
    
    // Resolution settings
    $res_map = [
        '480p'  => ['width' => 854, 'height' => 480, 'bitrate' => '1000k', 'audio_bitrate' => '96k'],
        '720p'  => ['width' => 1280, 'height' => 720, 'bitrate' => '2500k', 'audio_bitrate' => '128k'],
        '1080p' => ['width' => 1920, 'height' => 1080, 'bitrate' => '5000k', 'audio_bitrate' => '192k'],
    ];
    
    $res = $res_map[$resolution] ?? $res_map['720p'];
    
    // Step 1: Extract slides as images using LibreOffice
    $extract_cmd = sprintf(
        'cd %s && libreoffice --headless --convert-to png %s 2>&1',
        escapeshellarg($temp_dir),
        escapeshellarg($pptx_path)
    );
    
    exec($extract_cmd, $output, $return_var);
    
    if ($return_var !== 0) {
        // Fallback: try using PhpSpreadsheet or direct extraction
        cleanup_temp($temp_dir);
        return ['success' => false, 'error' => 'Failed to extract slides. LibreOffice may not be installed.'];
    }
    
    // Find extracted images
    $slide_images = glob($temp_dir . '*.png');
    sort($slide_images, SORT_NATURAL);
    
    if (empty($slide_images)) {
        cleanup_temp($temp_dir);
        return ['success' => false, 'error' => 'No slide images were generated.'];
    }
    
    // Step 2: Create FFmpeg concat file
    $concat_file = $temp_dir . 'concat.txt';
    $duration_per_slide = 5; // Default seconds per slide
    
    // Try to get timing from PPTX
    if ($conversion['duration'] > 0 && $conversion['slide_count'] > 0) {
        $duration_per_slide = round($conversion['duration'] / $conversion['slide_count']);
    }
    
    $fp = fopen($concat_file, 'w');
    foreach ($slide_images as $img) {
        fwrite($fp, "file '" . addslashes($img) . "'\n");
        fwrite($fp, "duration {$duration_per_slide}\n");
    }
    // FFmpeg concat needs last file repeated
    fwrite($fp, "file '" . addslashes(end($slide_images)) . "'\n");
    fclose($fp);
    
    // Step 3: Extract narration audio from PPTX
    $audio_file = null;
    $zip = new ZipArchive();
    if ($zip->open($pptx_path) === true) {
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (preg_match('/ppt\/media\/.*\.(mp3|wav)$/i', $name)) {
                $ext = pathinfo($name, PATHINFO_EXTENSION);
                $audio_file = $temp_dir . 'narration.' . $ext;
                $zip->extractTo($temp_dir, [$name]);
                if (file_exists($temp_dir . $name)) {
                    rename($temp_dir . $name, $audio_file);
                }
                break;
            }
        }
        $zip->close();
    }
    
    // Step 4: Build FFmpeg command
    $total_duration = count($slide_images) * $duration_per_slide;
    
    if ($audio_file && file_exists($audio_file)) {
        // With narration
        $ffmpeg_cmd = sprintf(
            '%s -y -f concat -safe 0 -i %s -i %s -c:v libx264 -pix_fmt yuv420p -r 30 -s %dx%d -b:v %s -preset medium -c:a aac -b:a %s -ar 44100 -shortest -movflags +faststart %s 2>&1',
            FFMPEG_PATH,
            escapeshellarg($concat_file),
            escapeshellarg($audio_file),
            $res['width'], $res['height'],
            $res['bitrate'], $res['audio_bitrate'],
            escapeshellarg($output_path)
        );
    } else {
        // Without narration (silent video)
        $ffmpeg_cmd = sprintf(
            '%s -y -f concat -safe 0 -i %s -f lavfi -i anullsrc=r=44100:cl=stereo -c:v libx264 -pix_fmt yuv420p -r 30 -s %dx%d -b:v %s -preset medium -c:a aac -b:a %s -t %d -movflags +faststart %s 2>&1',
            FFMPEG_PATH,
            escapeshellarg($concat_file),
            $res['width'], $res['height'],
            $res['bitrate'], $res['audio_bitrate'],
            $total_duration,
            escapeshellarg($output_path)
        );
    }
    
    exec($ffmpeg_cmd, $ffmpeg_output, $ffmpeg_return);
    
    // Get actual duration
    $actual_duration = $total_duration;
    if (file_exists($output_path)) {
        $probe_cmd = sprintf('%s -v quiet -print_format json -show_format %s 2>&1', FFPROBE_PATH, escapeshellarg($output_path));
        exec($probe_cmd, $probe_output);
        $probe_data = json_decode(implode('', $probe_output), true);
        if (isset($probe_data['format']['duration'])) {
            $actual_duration = intval(floatval($probe_data['format']['duration']));
        }
    }
    
    // Cleanup
    cleanup_temp($temp_dir);
    
    if ($ffmpeg_return !== 0 || !file_exists($output_path)) {
        return ['success' => false, 'error' => 'FFmpeg rendering failed.'];
    }
    
    return ['success' => true, 'duration' => $actual_duration, 'file_size' => filesize($output_path)];
}

/**
 * Get credit cost for resolution
 */
function get_credit_cost($resolution) {
    $costs = ['480p' => CREDITS_480P, '720p' => CREDITS_720P, '1080p' => CREDITS_1080P];
    return $costs[$resolution] ?? 2;
}

/**
 * Deduct credits from user account
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
    
    // Update session
    if (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $user_id) {
        $_SESSION['user_credits'] = $new_balance;
    }
    
    return true;
}

/**
 * Get conversion status
 */
function conversion_status($job_id, $user_id = null) {
    $query = "SELECT c.*, GROUP_CONCAT(DISTINCT o.resolution) as available_resolutions 
              FROM conversions c 
              LEFT JOIN output_files o ON c.id = o.conversion_id 
              WHERE c.job_id = ?";
    $params = [$job_id];
    $types = "s";
    
    if ($user_id) {
        $query .= " AND c.user_id = ?";
        $params[] = $user_id;
        $types .= "i";
    }
    
    $query .= " GROUP BY c.id";
    
    return db_query_one($query, $types, $params);
}

/**
 * Get download file path
 */
function conversion_download($job_id, $resolution, $user_id) {
    $conversion = db_query_one(
        "SELECT id FROM conversions WHERE job_id = ? AND user_id = ? AND status = 'completed'",
        "si",
        [$job_id, $user_id]
    );
    
    if (!$conversion) return null;
    
    $output = db_query_one(
        "SELECT * FROM output_files WHERE conversion_id = ? AND resolution = ?",
        "is",
        [$conversion['id'], $resolution]
    );
    
    if (!$output || !file_exists($output['file_path'])) return null;
    
    // Increment download count
    db_query("UPDATE output_files SET download_count = download_count + 1 WHERE id = ?", "i", [$output['id']]);
    
    return $output;
}

/**
 * Get user's conversion history
 */
function conversion_history($user_id, $page = 1, $per_page = 20) {
    $offset = ($page - 1) * $per_page;
    
    $conversions = db_query(
        "SELECT c.*, GROUP_CONCAT(DISTINCT o.resolution) as resolutions 
         FROM conversions c 
         LEFT JOIN output_files o ON c.id = o.conversion_id 
         WHERE c.user_id = ? 
         GROUP BY c.id 
         ORDER BY c.created_at DESC 
         LIMIT ? OFFSET ?",
        "iii",
        [$user_id, $per_page, $offset]
    );
    
    $total = db_query_one("SELECT COUNT(*) as count FROM conversions WHERE user_id = ?", "i", [$user_id]);
    
    return [
        'data' => $conversions ?: [],
        'total' => $total['count'] ?? 0,
        'page' => $page,
        'per_page' => $per_page,
        'pages' => ceil(($total['count'] ?? 0) / $per_page)
    ];
}

/**
 * Cleanup temporary files
 */
function cleanup_temp($dir) {
    if (!is_dir($dir)) return;
    
    $files = glob($dir . '*');
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
    @rmdir($dir);
}

/**
 * Log activity
 */
function log_activity($user_id, $action, $entity_type = null, $entity_id = null, $details = null) {
    db_query(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)",
        "ississ",
        [$user_id, $action, $entity_type ?? '', $entity_id ?? 0, $details ? json_encode($details) : null, $_SERVER['REMOTE_ADDR'] ?? '']
    );
}
?>
