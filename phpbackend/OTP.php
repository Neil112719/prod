<?php
include 'config.php';

// Set PHP time zone to Philippines (Asia/Manila)
date_default_timezone_set('Asia/Manila');

$data = json_decode(file_get_contents('php://input'), true);
$userID = $data['userID'];
$currentTimestamp = date('Y-m-d H:i:s'); // Current time in PHP format

// Check for existing OTP in MySQL
$query = $conn->prepare("
    SELECT otp, otp_generation 
    FROM auth 
    WHERE id = ?
");
$query->bind_param("s", $userID);
$query->execute();
$result = $query->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $otpTime = strtotime($row['otp_generation']); // OTP generation time in seconds
    $currentTime = time(); // Current PHP time in seconds

    // Debugging logs
    error_log("OTP Generation Time: " . $row['otp_generation']);
    error_log("Parsed OTP Time: " . $otpTime);
    error_log("Current Time: " . $currentTime);
    error_log("Time Difference: " . ($currentTime - $otpTime));

    if ($otpTime === false || $currentTime - $otpTime > 300) { // OTP expired (older than 5 minutes)
        $otp = rand(100000, 999999); // Generate new OTP
        $updateQuery = $conn->prepare("UPDATE auth SET otp = ?, otp_generation = ?, otp_last_sent = ? WHERE id = ?");
        $updateQuery->bind_param("isss", $otp, $currentTimestamp, $currentTimestamp, $userID);
        $updateQuery->execute();
        echo json_encode(['status' => 'otp_generated', 'otp' => $otp]); // Include OTP for testing
    } else {
        $updateQuery = $conn->prepare("UPDATE auth SET otp_last_sent = ? WHERE id = ?");
        $updateQuery->bind_param("ss", $currentTimestamp, $userID);
        $updateQuery->execute();
        echo json_encode(['status' => 'otp_resent']);
    }
} else {
    $otp = rand(100000, 999999);
    $insertQuery = $conn->prepare("INSERT INTO auth (id, otp, otp_generation, otp_last_sent) VALUES (?, ?, ?, ?)");
    $insertQuery->bind_param("siss", $userID, $otp, $currentTimestamp, $currentTimestamp);
    $insertQuery->execute();
    echo json_encode(['status' => 'otp_generated', 'otp' => $otp]); // Include OTP for testing
}
?>
