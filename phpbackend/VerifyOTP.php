<?php
include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$userID = $data['userID'];
$otp = $data['otp'];

// Verify OTP in MySQL
$query = $conn->prepare("SELECT otp FROM auth WHERE id = ? AND otp = ?");
$query->bind_param("si", $userID, $otp);
$query->execute();
$result = $query->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid OTP']);
}
?>
