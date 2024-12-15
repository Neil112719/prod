<?php
include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

// Extract fields from the request body
$id = $data['id'] ?? null;
$password = $data['password'] ?? null;
$usertype = $data['usertype'] ?? null;
$fname = $data['fname'] ?? null;
$mname = $data['mname'] ?? null;
$lastname = $data['lastname'] ?? null;
$suffix = $data['suffix'] ?? null;
$email = $data['email'] ?? null;
$department = $data['department'] ?? null;
$program = $data['program'] ?? null;
$year_level = $data['year'] ?? null; // Correct field name
$section = $data['section'] ?? null;

// Validate required fields
if (!$id || !$password || !$usertype || !$fname || !$lastname || !$email) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']);
    exit;
}

// Start a transaction to ensure atomicity
$conn->begin_transaction();

try {
    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert into the users table
    $userQuery = $conn->prepare("INSERT INTO users (id, password, usertype) VALUES (?, ?, ?)");
    $userQuery->bind_param('ssi', $id, $hashedPassword, $usertype);

    if (!$userQuery->execute()) {
        throw new Exception('Failed to insert into users table.');
    }

    // Insert into the profiles table
    $profileQuery = $conn->prepare("
        INSERT INTO profiles (id, fname, mname, lastname, suffix, email, department, program, year_level, section)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $profileQuery->bind_param(
        'ssssssssis', // Corrected binding type for year_level
        $id,
        $fname,
        $mname,
        $lastname,
        $suffix,
        $email,
        $department,
        $program,
        $year_level, // Automatically set to null if no value is provided
        $section
    );

    if (!$profileQuery->execute()) {
        throw new Exception('Failed to insert into profiles table.');
    }

    // Insert into the auth table
    $authQuery = $conn->prepare("
        INSERT INTO auth (id, force_password_change)
        VALUES (?, 1)
    ");
    $authQuery->bind_param('s', $id);

    if (!$authQuery->execute()) {
        throw new Exception('Failed to insert into auth table.');
    }

    // Commit the transaction
    $conn->commit();

    echo json_encode(['status' => 'success', 'message' => 'User created successfully.']);
} catch (Exception $e) {
    // Roll back the transaction on error
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    // Close the prepared statements
    if (isset($userQuery)) $userQuery->close();
    if (isset($profileQuery)) $profileQuery->close();
    if (isset($authQuery)) $authQuery->close();

    // Close the database connection
    $conn->close();
}
?>
