<?php
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
        $conn = @mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME, defined('DB_PORT') ? DB_PORT : 3306);
        
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
 */
function db_query($query, $types = '', $params = []) {
    $conn = get_db_connection();
    if (!$conn) return false;
    
    if (empty($types)) {
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
        $return = [
            'affected_rows' => mysqli_stmt_affected_rows($stmt),
            'insert_id' => mysqli_stmt_insert_id($stmt)
        ];
        mysqli_stmt_close($stmt);
        return $return;
    }
    
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
 * Escape string
 */
function db_escape($string) {
    $conn = get_db_connection();
    if (!$conn) return '';
    return mysqli_real_escape_string($conn, $string);
}

/**
 * Close database connection
 */
function db_close() {
    static $closed = false;
    if ($closed) return;
    $conn = get_db_connection();
    if ($conn) {
        mysqli_close($conn);
        $closed = true;
    }
}

register_shutdown_function('db_close');
?>
