<?php
// Database configuration for InfinityFree
// IMPORTANT: Update these values with your actual InfinityFree credentials
define('DB_HOST', 'sql311.infinityfree.com'); // Thay bằng host của bạn
define('DB_USER', 'if0_38341624'); // Thay bằng username của bạn
define('DB_PASS', 'your_password_here'); // Thay bằng password thật
define('DB_NAME', 'if0_38341624_tieudoan15db'); // Thay bằng database name của bạn

// Environment: Set to 'production' on InfinityFree hosting
putenv('ENVIRONMENT=development'); // Change to 'production' when deployed

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed']));
}

// Set charset
$conn->set_charset("utf8mb4");

// Environment-based error reporting
if (getenv('ENVIRONMENT') === 'production') {
    error_reporting(0);
    ini_set('display_errors', 0);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
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
