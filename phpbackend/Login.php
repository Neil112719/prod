<?php
include 'config.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
$data = json_decode(file_get_contents('php://input'), true);
$userID = $data['userID'];
$password = $data['password'];

// Check user credentials in MySQL
$query = $conn->prepare("
    SELECT u.password, u.usertype, p.email, p.fname, p.mname, p.lastname, p.suffix 
    FROM users u
    JOIN profiles p ON u.id = p.id
    WHERE u.id = ?
");
$query->bind_param("s", $userID);
$query->execute();
$result = $query->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (password_verify($password, $row['password'])) {
        $secretKey = $_ENV['JWT_SECRET'];
        $issuedAt = time();
        $expiry = $issuedAt + 3600; // 1-hour expiration

        $payload = [
            'iss' => $_ENV['REACT_APP_BACKEND_ADDRESS'],
            'aud' => $_ENV['REACT_APP_FRONTEND_ADDRESS'],
            'iat' => $issuedAt,
            'exp' => $expiry,
            'userID' => $userID,
            'userType' => $row['usertype']
        ];

        $jwt = JWT::encode($payload, $secretKey, 'HS256');
        $phpSessionID = session_id(); // Get the current PHPSESSID

        // Store session in MongoDB
        $collection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'activeSessions');
        $collection->updateOne(
            ['userID' => $userID],
            [
                '$set' => [
                    'userID' => $userID,
                    'token' => $jwt,
                    'phpSessionID' => $phpSessionID,
                    'expiresAt' => new MongoDB\BSON\UTCDateTime($expiry * 1000)
                ]
            ],
            ['upsert' => true]
        );

        // Set JWT as HTTP-only cookie
        setcookie("authToken", $jwt, [
            'expires' => $expiry,
            'path' => '/',
            'domain' => 'localhost',
            'secure' => false, // Change to true in production
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        echo json_encode([
            'status' => 'success',
            'userID' => $userID,
            'userType' => $row['usertype'],
            'email' => $row['email'],
            'fname' => $row['fname'],
            'mname' => $row['mname'],
            'lname' => $row['lastname'],
            'suffix' => $row['suffix'],
            'session' => $phpSessionID
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'User not found']);
}
?>
