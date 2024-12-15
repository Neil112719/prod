<?php
include 'config.php';

// Decode JSON payload
$data = json_decode(file_get_contents('php://input'), true);

$usertype = $data['usertype'] ?? null;
$department = $data['department'] ?? null;
$program = $data['program'] ?? null;

// Validate required fields
if (!$usertype) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Usertype is required.']);
    exit;
}

// Construct the base query
$query = "
    SELECT 
        u.id, 
        p.fname, 
        p.mname, 
        p.lastname, 
        p.suffix, 
        p.email, 
        u.usertype, 
        p.department, 
        p.program, 
        p.section, 
        p.year_level 
    FROM users u
    JOIN profiles p ON u.id = p.id
    WHERE u.usertype IN (" . implode(',', array_fill(0, count($usertype), '?')) . ")
";

// Add optional filters dynamically
$params = $usertype;
if ($department) {
    $query .= " AND p.department = ?";
    $params[] = $department;
}
if ($program) {
    $query .= " AND p.program = ?";
    $params[] = $program;
}

// Prepare and bind parameters
$stmt = $conn->prepare($query);
$stmt->bind_param(str_repeat("s", count($params)), ...$params);

// Execute the query
$stmt->execute();
$result = $stmt->get_result();

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

// Return results as JSON
echo json_encode($users);
?>
