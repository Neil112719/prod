<?php
include 'config.php';

// Decode JSON payload
$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;
$fieldsToUpdate = $data['updates'] ?? [];

// Validate required parameters
if (!$id || empty($fieldsToUpdate)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required parameters.']);
    exit;
}

// Separate fields for users and profiles tables
$usersFields = ['usertype'];
$profilesFields = ['fname', 'mname', 'lastname', 'suffix', 'email', 'department', 'program', 'section', 'year_level'];

$usersSetClauses = [];
$profilesSetClauses = [];
$usersParams = [];
$profilesParams = [];
$usersParamTypes = '';
$profilesParamTypes = '';

// Build SET clauses and parameters for each table
foreach ($fieldsToUpdate as $field => $value) {
    // Exclude restricted fields
    if (in_array($field, ['otp', 'otp_generation', 'otp_last_sent'])) {
        continue;
    }

    if (in_array($field, $usersFields)) {
        $usersSetClauses[] = "$field = ?";
        $usersParams[] = $value;
        $usersParamTypes .= 's'; // Assuming all fields are strings; adjust if necessary
    } elseif (in_array($field, $profilesFields)) {
        $profilesSetClauses[] = "$field = ?";
        $profilesParams[] = $value;
        $profilesParamTypes .= 's';
    }
}

// Add the ID parameter at the end of both tables' parameters
$usersParams[] = $id;
$usersParamTypes .= 's';

$profilesParams[] = $id;
$profilesParamTypes .= 's';

$conn->begin_transaction(); // Start a transaction

try {
    // Update the users table if applicable
    if (!empty($usersSetClauses)) {
        $usersQuery = "UPDATE users SET " . implode(', ', $usersSetClauses) . " WHERE id = ?";
        $stmt = $conn->prepare($usersQuery);
        $stmt->bind_param($usersParamTypes, ...$usersParams);
        if (!$stmt->execute()) {
            throw new Exception('Failed to update users table: ' . $stmt->error);
        }
        $stmt->close();
    }

    // Update the profiles table if applicable
    if (!empty($profilesSetClauses)) {
        $profilesQuery = "UPDATE profiles SET " . implode(', ', $profilesSetClauses) . " WHERE id = ?";
        $stmt = $conn->prepare($profilesQuery);
        $stmt->bind_param($profilesParamTypes, ...$profilesParams);
        if (!$stmt->execute()) {
            throw new Exception('Failed to update profiles table: ' . $stmt->error);
        }
        $stmt->close();
    }

    $conn->commit(); // Commit the transaction
    echo json_encode(['status' => 'success', 'message' => 'User updated successfully.']);
} catch (Exception $e) {
    $conn->rollback(); // Rollback the transaction in case of error
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
