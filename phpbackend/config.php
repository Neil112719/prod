<?php

require __DIR__ . '/vendor/autoload.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


use Dotenv\Dotenv;
use MongoDB\Client;

// Load .env variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Define allowed origin from the .env file
$allowedOrigin = $_ENV['REACT_APP_FRONTEND_ADDRESS'] ?? 'http://localhost:3000';

// Enable CORS dynamically
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowedOrigin) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
} else {
    header("HTTP/1.1 403 Forbidden");
    echo json_encode([
        "status" => "error",
        "message" => "Origin not allowed."
    ]);
    exit;
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// MySQL Connection
$conn = new mysqli(
    $_ENV['REACT_APP_MYSQL_HOST'],
    $_ENV['REACT_APP_MYSQL_USERNAME'],
    $_ENV['REACT_APP_MYSQL_PASSWORD'],
    $_ENV['REACT_APP_MYSQL_DATABASE']
);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "MySQL Connection failed: " . $conn->connect_error
    ]));
}

// MongoDB Connection
try {
    $mongoClient = new Client($_ENV['REACT_APP_MONGO_URI']);
    $mongoDB = $mongoClient->selectDatabase($_ENV['REACT_APP_MONGO_DB_NAME']);
} catch (Exception $e) {
    die(json_encode([
        "status" => "error",
        "message" => "MongoDB Connection failed: " . $e->getMessage()
    ]));
}
?>
