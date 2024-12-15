<?php
include 'config.php'; // Includes MongoDB, MySQL setup, and CORS handling

try {
    // Handle incoming requests
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Decode JSON payload if Content-Type is application/json
        $inputData = json_decode(file_get_contents('php://input'), true);
        $action = $inputData['action'] ?? ($_POST['action'] ?? null);

        // Validate the action
        if (!$action) {
            throw new Exception('Action is required');
        }

        // Perform the requested action
        switch ($action) {
            case 'getDepartments':
                $response = getDepartments($mongoClient);
                break;

            case 'getProgramsByDepartment':
                $department = $inputData['department'] ?? ($_POST['department'] ?? '');
                $response = getProgramsByDepartment($mongoClient, $department);
                break;

            case 'getYearLevelsByProgram':
                $programCode = $inputData['programCode'] ?? ($_POST['programCode'] ?? '');
                $response = getYearLevelsByProgram($mongoClient, $programCode);
                break;

            case 'getSectionsByYear':
                $programCode = $inputData['programCode'] ?? ($_POST['programCode'] ?? '');
                $year = $inputData['year'] ?? ($_POST['year'] ?? '');
                $response = getSectionsByYear($mongoClient, $programCode, $year);
                break;

            case 'getSubjectsBySection':
                $sectionCode = $inputData['sectionCode'] ?? ($_POST['sectionCode'] ?? '');
                $response = getSubjectsBySection($mongoClient, $sectionCode);
                break;

            case 'getTeachersBySubject':
                $subjectCode = $inputData['subjectCode'] ?? ($_POST['subjectCode'] ?? '');
                $response = getTeachersBySubject($mongoClient, $subjectCode);
                break;

            default:
                $response = ['error' => 'Invalid action'];
                break;
        }

        // Return the JSON response
        echo json_encode($response);
    } else {
        throw new Exception('Invalid request method');
    }
} catch (Exception $e) {
    // Log the error for debugging purposes
    error_log('Error in search.php: ' . $e->getMessage());

    // Send a generic error message to the client
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred. Please try again later.']);
}

// Functions
function getDepartments($mongoClient) {
    $collection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'departments');
    $departments = $collection->find()->toArray();

    return array_map(function ($dept) {
        return [
            'id' => (string) $dept['_id'], // Convert ObjectId to string
            'name' => $dept['Department_name'],
        ];
    }, $departments);
}

function getProgramsByDepartment($mongoClient, $department) {
    $collection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'departments');
    $departmentData = $collection->findOne(['Department_name' => $department]);

    if ($departmentData) {
        $programCodes = $departmentData['program_codes'];
        $programsCollection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'programs');
        $programs = $programsCollection->find(['program_code' => ['$in' => $programCodes]])->toArray();

        return array_map(function ($program) {
            return [
                'code' => $program['program_code'],
                'name' => $program['program_name'],
            ];
        }, $programs);
    }
    return [];
}

function getYearLevelsByProgram($mongoClient, $programCode) {
    $collection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'programs');
    $program = $collection->findOne(['program_code' => $programCode]);

    if ($program && isset($program['year_levels'])) {
        $yearLevels = is_array($program['year_levels']) ? $program['year_levels'] : iterator_to_array($program['year_levels']);
        return array_map(function ($yearLevel) {
            return [
                'year' => $yearLevel['year'],
                'sections' => is_array($yearLevel['section_codes']) ? $yearLevel['section_codes'] : iterator_to_array($yearLevel['section_codes']),
            ];
        }, $yearLevels);
    }
    return [];
}

function getSectionsByYear($mongoClient, $programCode, $year) {
    $programsCollection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'programs');
    $sectionsCollection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'sections');

    // Fetch program details
    $program = $programsCollection->findOne(['program_code' => $programCode]);

    if ($program && isset($program['year_levels'])) {
        $yearLevels = is_array($program['year_levels']) ? $program['year_levels'] : iterator_to_array($program['year_levels']);
        foreach ($yearLevels as $yearLevel) {
            if ($yearLevel['year'] == $year) {
                $sectionCodes = is_array($yearLevel['section_codes']) ? $yearLevel['section_codes'] : iterator_to_array($yearLevel['section_codes']);
                
                // Fetch the section names from the sections collection
                $sections = $sectionsCollection->find(['section_code' => ['$in' => $sectionCodes]])->toArray();

                return array_map(function ($section) {
                    return [
                        'code' => $section['section_code'],
                        'name' => $section['section_name'], // Include the section name
                    ];
                }, $sections);
            }
        }
    }
    return [];
}

function getSubjectsBySection($mongoClient, $sectionCode) {
    $collection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'sections');
    $section = $collection->findOne(['section_code' => $sectionCode]);

    if ($section) {
        $subjectCodes = is_array($section['subjects_codes']) ? $section['subjects_codes'] : iterator_to_array($section['subjects_codes']);
        $subjectsCollection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'subjects');
        $subjects = $subjectsCollection->find(['subject_code' => ['$in' => $subjectCodes]])->toArray();

        return array_map(function ($subject) {
            return [
                'code' => $subject['subject_code'],
                'name' => $subject['subject_name'],
            ];
        }, $subjects);
    }
    return [];
}

function getTeachersBySubject($mongoClient, $subjectCode) {
    $collection = $mongoClient->selectCollection($_ENV['REACT_APP_MONGO_DB_NAME'], 'subjects');
    $subject = $collection->findOne(['subject_code' => $subjectCode]);

    if ($subject && isset($subject['instructors'])) {
        $instructors = is_array($subject['instructors']) ? $subject['instructors'] : iterator_to_array($subject['instructors']);
        return array_map(function ($instructor) {
            return [
                'id' => $instructor['instructor_id'],
                'name' => $instructor['instructor_name'],
            ];
        }, $instructors);
    }
    return [];
}
?>
