<?php
include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;
$newPassword = $data['password'] ?? null;
$forcePasswordChange = $data['force_password_change'] ?? null;

// Validate input
if (!$id || !$newPassword || is_null($forcePasswordChange)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required parameters.']);
    exit;
}

// Hash the new password
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

// Start a transaction to ensure consistency
$conn->begin_transaction();

try {
    // Update the password in the users table
    $updateUserQuery = "UPDATE users SET password = ? WHERE id = ?";
    $stmt = $conn->prepare($updateUserQuery);
    $stmt->bind_param('ss', $hashedPassword, $id);

    if (!$stmt->execute()) {
        throw new Exception('Failed to update password in users table.');
    }

    $stmt->close();

    // Update the force_password_change in the auth table
    $updateAuthQuery = "UPDATE auth SET force_password_change = ? WHERE id = ?";
    $stmt = $conn->prepare($updateAuthQuery);
    $stmt->bind_param('is', $forcePasswordChange, $id);

    if (!$stmt->execute()) {
        throw new Exception('Failed to update force_password_change in auth table.');
    }

    $stmt->close();

    // Commit the transaction
    $conn->commit();

    echo json_encode(['status' => 'success', 'message' => 'Password changed successfully.']);
} catch (Exception $e) {
    // Roll back the transaction on error
    $conn->rollback();

    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

// Close the connection
$conn->close();
?>
