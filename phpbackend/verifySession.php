<?php
include 'config.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$jwt = $_COOKIE['authToken'] ?? null;
$phpSessionID = session_id(); // Retrieve the current session ID

if (!$jwt || !$phpSessionID) {
    echo json_encode(['status' => 'error', 'message' => 'No session token or PHPSESSID provided']);
    http_response_code(401);
    exit;
}

try {
    $secretKey = $_ENV['JWT_SECRET'];
    $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));

    $collection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'activeSessions');
    $session = $collection->findOne([
        'userID' => $decoded->userID,
        'token' => $jwt,
        'phpSessionID' => $phpSessionID
    ]);

    if (!$session) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid session or session token']);
        http_response_code(401);
        exit;
    }

    // Check if the session has expired
    if ($session['expiresAt']->toDateTime()->getTimestamp() < time()) {
        $collection->deleteOne(['userID' => $decoded->userID]);
        echo json_encode(['status' => 'error', 'message' => 'Session expired']);
        http_response_code(401);
        exit;
    }

    // Update the session with the last verified timestamp and PHPSESSID
    $now = new MongoDB\BSON\UTCDateTime((new DateTime('now', new DateTimeZone('Asia/Manila')))->getTimestamp() * 1000);
    $collection->updateOne(
        ['userID' => $decoded->userID, 'token' => $jwt],
        ['$set' => ['lastVerifiedAt' => $now, 'phpSessionIDverify' => $phpSessionID]]
    );

    // Respond with success, user details, and PHPSESSID
    echo json_encode([
        'status' => 'success',
        'userID' => $decoded->userID,
        'userType' => $decoded->userType,
        'lastVerifiedAt' => $now->toDateTime()->format('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid session token']);
    http_response_code(401);
}
?>