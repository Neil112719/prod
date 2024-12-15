<?php

require_once 'config.php'; // Includes the database configurations for MySQL and MongoDB

try {
    // MySQL Table Setup
    $createUsersTable = "
    CREATE TABLE IF NOT EXISTS `users` (
        `id` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `password` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `email` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `usertype` TINYINT(3) NOT NULL,
        PRIMARY KEY (`id`) USING BTREE,
        UNIQUE INDEX `id` (`id`) USING BTREE,
        UNIQUE INDEX `email` (`email`) USING BTREE
    ) COLLATE='utf8mb4_0900_ai_ci' ENGINE=InnoDB;
    ";

    $createAuthTable = "
    CREATE TABLE IF NOT EXISTS `auth` (
        `id` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `otp` INT(10) NULL DEFAULT NULL,
        `otp_generation` TIMESTAMP NULL DEFAULT NULL,
        `otp_last_sent` TIMESTAMP NULL DEFAULT NULL,
        `force_password_change` INT(10) NULL DEFAULT '1',
        UNIQUE INDEX `id` (`id`) USING BTREE,
        CONSTRAINT `FK_auth_users` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
    ) COLLATE='utf8mb4_0900_ai_ci' ENGINE=InnoDB;
    ";

    $createProfilesTable = "
    CREATE TABLE IF NOT EXISTS `profiles` (
        `id` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `fname` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `mname` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `lastname` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `suffix` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `email` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `department` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `program` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `section` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
        `year_level` TINYINT(3) NULL DEFAULT NULL,
        UNIQUE INDEX `id` (`id`) USING BTREE,
        CONSTRAINT `FK_profiles_users` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
    ) COLLATE='utf8mb4_0900_ai_ci' ENGINE=InnoDB;
    ";

    // Execute MySQL queries
    $conn->query($createUsersTable);
    $conn->query($createAuthTable);
    $conn->query($createProfilesTable);

    // Seed Admin User
    $adminId = 'Admin';
    $adminPassword = password_hash('Admin', PASSWORD_BCRYPT); // Secure password hashing
    $adminEmail = 'sample@sample.com';
    $adminUsertype = 1;

    $insertAdminQuery = "
    INSERT INTO `users` (`id`, `password`, `email`, `usertype`)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE `password` = VALUES(`password`), `email` = VALUES(`email`), `usertype` = VALUES(`usertype`);
    ";

    $stmt = $conn->prepare($insertAdminQuery);
    $stmt->bind_param("sssi", $adminId, $adminPassword, $adminEmail, $adminUsertype);
    $stmt->execute();

    // MongoDB Data Population
    $departmentsCollection = $mongoDB->departments;
    $programsCollection = $mongoDB->programs;
    $sectionsCollection = $mongoDB->sections;
    $subjectsCollection = $mongoDB->subjects;

    $departments = [
        [
            "Department_name" => "CETA",
            "program_codes" => ["ElecEng", "MechEng", "CivilEng"]
        ],
        [
            "Department_name" => "CAS",
            "program_codes" => ["Psych", "BioSci", "MathSci"]
        ],
        [
            "Department_name" => "CBA",
            "program_codes" => ["Acct", "Fin", "Mktg"]
        ],
        [
            "Department_name" => "COE",
            "program_codes" => ["CompSci", "IT", "SoftEng"]
        ],
        [
            "Department_name" => "CHE",
            "program_codes" => ["ChemEng", "EnvEng", "FoodTech"]
        ]
    ];

    $programs = [];
    $sections = [];
    $subjects = [];

    foreach ($departments as $dept) {
        foreach ($dept['program_codes'] as $programCode) {
            $programName = ucfirst(strtolower($programCode)) . " Program";
            $yearLevels = [];
            for ($year = 1; $year <= 5; $year++) {
                $sectionCodes = [];
                for ($section = 1; $section <= 3; $section++) {
                    $sectionCode = "Sec{$year}{$section}";
                    $sectionName = "Section {$year}{$section}";

                    $subjectCodes = [];
                    for ($subject = 1; $subject <= 3; $subject++) {
                        $subjectCode = "SUB{$year}{$section}{$subject}";
                        $subjectName = "Subject {$subject} (Year {$year}, Section {$section})";
                        $instructors = [
                            [
                                "instructor_id" => rand(100000, 999999),
                                "instructor_name" => "Instructor_" . rand(1, 50)
                            ],
                            [
                                "instructor_id" => rand(100000, 999999),
                                "instructor_name" => "Instructor_" . rand(51, 100)
                            ]
                        ];

                        $subjects[] = [
                            "subject_code" => $subjectCode,
                            "subject_name" => $subjectName,
                            "instructors" => $instructors
                        ];

                        $subjectCodes[] = $subjectCode;
                    }

                    $sections[] = [
                        "section_code" => $sectionCode,
                        "section_name" => $sectionName,
                        "subjects_codes" => $subjectCodes
                    ];

                    $sectionCodes[] = $sectionCode;
                }

                $yearLevels[] = [
                    "year" => (string) $year,
                    "section_codes" => $sectionCodes
                ];
            }

            $programs[] = [
                "program_code" => $programCode,
                "program_name" => $programName,
                "year_levels" => $yearLevels
            ];
        }
    }

    $departmentsCollection->insertMany($departments);
    $programsCollection->insertMany($programs);
    $sectionsCollection->insertMany($sections);
    $subjectsCollection->insertMany($subjects);

    echo json_encode([
        "status" => "success",
        "message" => "MySQL tables created, admin user with email added, and MongoDB data populated successfully."
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Setup failed: " . $e->getMessage()
    ]);
    exit;
}

?>
