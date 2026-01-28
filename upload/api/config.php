<?php
// Database configuration for InfinityFree
define('DB_HOST', 'sql301.infinityfree.com');
define('DB_PORT', '3306');
define('DB_USER', 'if0_40987709');
define('DB_PASS', 'hbmTY2vzxg');
define('DB_NAME', 'if0_40987709_tieudoan15db');

// Set environment to production
putenv('ENVIRONMENT=production');

// Enable error reporting for debugging (disable in production)
if (getenv('ENVIRONMENT') === 'production') {
    error_reporting(0);
    ini_set('display_errors', 0);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Helper functions
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode(['error' => $message]);
    exit;
}

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Helper functions
function safeParse($str) {
    if (!$str) return [];
    try {
        if (is_string($str)) {
            return json_decode($str, true);
        }
        return $str;
    } catch (Exception $e) {
        return [];
    }
}

function safeStringify($obj) {
    if (is_string($obj)) return $obj;
    return json_encode($obj ?: []);
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function sendError($message, $statusCode = 500) {
    http_response_code($statusCode);
    echo json_encode(['error' => $message]);
    exit();
}

function getRequestBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}
?>
