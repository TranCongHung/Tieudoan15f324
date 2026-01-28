<?php
require_once 'config.php';

// Get the endpoint from URL
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Remove 'api' from path if present
if ($path_parts[0] === 'api') {
    array_shift($path_parts);
}

$endpoint = $path_parts[0] ?? '';
$id = $path_parts[1] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($endpoint) {
        case 'articles':
            handleCRUD('articles', $method, $id, [], 'date DESC');
            break;
            
        case 'milestones':
            handleCRUD('milestones', $method, $id, ['quiz'], 'year ASC');
            break;
            
        case 'questions':
            handleCRUD('questions', $method, $id, ['options']);
            break;
            
        case 'users':
            if ($method === 'POST' && !$id && isset($_POST['email']) && isset($_POST['password'])) {
                handleLogin();
            } else {
                handleCRUD('users', $method, $id, []);
            }
            break;
            
        case 'scores':
            handleCRUD('scores', $method, $id, [], 'date DESC');
            break;
            
        case 'leaders':
            handleCRUD('leaders', $method, $id, []);
            break;
            
        case 'media':
            handleCRUD('media', $method, $id, [], 'date DESC');
            break;
            
        case 'documents':
            handleCRUD('documents', $method, $id, [], 'date DESC');
            break;
            
        case 'quiz-results':
            handleCRUD('quiz_results', $method, $id, [], 'timestamp DESC');
            break;
            
        case 'comments':
            handleCRUD('comments', $method, $id, [], 'date ASC');
            break;
            
        case 'settings':
            handleSettings($method);
            break;
            
        case 'read-history':
            handleReadHistory($method, $path_parts);
            break;
            
        default:
            sendError('Endpoint not found', 404);
    }
} catch (Exception $e) {
    sendError($e->getMessage());
}

$conn->close();

// Generic CRUD handler
function handleCRUD($table, $method, $id, $jsonFields = [], $orderBy = '') {
    global $conn;
    
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $conn->prepare("SELECT * FROM $table WHERE id = ?");
                $stmt->bind_param("s", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                $data = $result->fetch_assoc();
                
                if ($data && !empty($jsonFields)) {
                    foreach ($jsonFields as $field) {
                        $data[$field] = safeParse($data[$field]);
                    }
                }
                
                sendResponse($data ?: ['error' => 'Not found'], $data ? 200 : 404);
            } else {
                $sql = "SELECT * FROM $table" . ($orderBy ? " ORDER BY $orderBy" : "");
                $result = $conn->query($sql);
                $data = [];
                
                while ($row = $result->fetch_assoc()) {
                    if (!empty($jsonFields)) {
                        foreach ($jsonFields as $field) {
                            $row[$field] = safeParse($row[$field]);
                        }
                    }
                    $data[] = $row;
                }
                
                sendResponse($data);
            }
            break;
            
        case 'POST':
            $body = getRequestBody();
            if (!$body) {
                sendError('Invalid request body');
            }
            
            // Process JSON fields
            foreach ($jsonFields as $field) {
                if (isset($body[$field])) {
                    $body[$field] = safeStringify($body[$field]);
                }
            }
            
            // Build INSERT query
            $fields = array_keys($body);
            $placeholders = str_repeat('?,', count($fields) - 1) . '?';
            $types = str_repeat('s', count($fields));
            
            $sql = "INSERT INTO $table (" . implode(',', $fields) . ") VALUES ($placeholders)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...array_values($body));
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                $newId = $conn->insert_id;
                $stmt = $conn->prepare("SELECT * FROM $table WHERE id = ?");
                $stmt->bind_param("s", $newId);
                $stmt->execute();
                $result = $stmt->get_result();
                $newItem = $result->fetch_assoc();
                
                if ($newItem && !empty($jsonFields)) {
                    foreach ($jsonFields as $field) {
                        $newItem[$field] = safeParse($newItem[$field]);
                    }
                }
                
                sendResponse($newItem, 201);
            } else {
                sendError('Failed to create record');
            }
            break;
            
        case 'PUT':
            if (!$id) {
                sendError('ID required for update');
            }
            
            $body = getRequestBody();
            if (!$body) {
                sendError('Invalid request body');
            }
            
            unset($body['id']); // Remove ID from update data
            
            // Process JSON fields
            foreach ($jsonFields as $field) {
                if (isset($body[$field])) {
                    $body[$field] = safeStringify($body[$field]);
                }
            }
            
            // Build UPDATE query
            $fields = array_keys($body);
            $setClause = implode(' = ?, ', $fields) . ' = ?';
            $types = str_repeat('s', count($fields) + 1);
            $values = array_values($body);
            $values[] = $id;
            
            $sql = "UPDATE $table SET $setClause WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$values);
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                $stmt = $conn->prepare("SELECT * FROM $table WHERE id = ?");
                $stmt->bind_param("s", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                $updatedItem = $result->fetch_assoc();
                
                if ($updatedItem && !empty($jsonFields)) {
                    foreach ($jsonFields as $field) {
                        $updatedItem[$field] = safeParse($updatedItem[$field]);
                    }
                }
                
                sendResponse($updatedItem);
            } else {
                sendError('Failed to update record or no changes made');
            }
            break;
            
        case 'DELETE':
            if (!$id) {
                sendError('ID required for delete');
            }
            
            $stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                sendResponse(['success' => true]);
            } else {
                sendError('Failed to delete record');
            }
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
}

// Handle login
function handleLogin() {
    global $conn;
    
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (!$email || !$password) {
        sendError('Email and password required');
    }
    
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
    $stmt->bind_param("ss", $email, $password);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if ($user) {
        unset($user['password']); // Remove password from response
        sendResponse($user);
    } else {
        sendError('Sai thông tin đăng nhập', 401);
    }
}

// Handle settings (key-value)
function handleSettings($method) {
    global $conn;
    
    switch ($method) {
        case 'GET':
            $result = $conn->query("SELECT * FROM settings");
            $settings = [];
            while ($row = $result->fetch_assoc()) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
            sendResponse($settings);
            break;
            
        case 'POST':
            $body = getRequestBody();
            if (!$body) {
                sendError('Invalid request body');
            }
            
            foreach ($body as $key => $value) {
                $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
                $stmt->bind_param("ss", $key, $value);
                $stmt->execute();
            }
            
            sendResponse(['success' => true]);
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
}

// Handle read history
function handleReadHistory($method, $path_parts) {
    global $conn;
    
    $action = $path_parts[1] ?? '';
    
    if ($action === 'mark' && $method === 'POST') {
        $body = getRequestBody();
        $userId = $body['userId'] ?? '';
        $userName = $body['userName'] ?? '';
        $userRank = $body['userRank'] ?? '';
        $unit = $body['unit'] ?? '';
        $milestoneId = $body['milestoneId'] ?? '';
        $milestoneTitle = $body['milestoneTitle'] ?? '';
        
        if (!$userId || !$milestoneId) {
            sendError('userId and milestoneId required');
        }
        
        $readHistoryId = "read_{$userId}_{$milestoneId}_" . time();
        $readAt = date('Y-m-d H:i:s');
        
        $stmt = $conn->prepare("INSERT INTO read_history (id, user_id, user_name, user_rank, unit, milestone_id, milestone_title, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssss", $readHistoryId, $userId, $userName, $userRank, $unit, $milestoneId, $milestoneTitle, $readAt);
        $stmt->execute();
        
        sendResponse(['success' => true]);
    } elseif ($action === 'check' && $method === 'GET') {
        $userId = $path_parts[2] ?? '';
        $milestoneId = $path_parts[3] ?? '';
        
        if (!$userId || !$milestoneId) {
            sendError('userId and milestoneId required');
        }
        
        $stmt = $conn->prepare("SELECT id FROM read_history WHERE user_id = ? AND milestone_id = ? LIMIT 1");
        $stmt->bind_param("ss", $userId, $milestoneId);
        $stmt->execute();
        $result = $stmt->get_result();
        $hasRead = $result->num_rows > 0;
        
        sendResponse(['hasRead' => $hasRead]);
    } else {
        sendError('Invalid read history action', 400);
    }
}
?>
