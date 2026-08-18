<?php
/**
 * YNR MAKİNE YÖVMİYE VE PUANTAJ PRO
 * Veritabanı Yapılandırması & PDO Otomatik Kurulum Motoru
 */

// Veritabanı Erişim Bilgileri (Kendi cPanel / MySQL bilgilerinize göre düzenleyin)
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'ynrmakin_ynr_pdks');
define('DB_USER', 'ynrmakin_pdks');
define('DB_PASS', 'Alp48374700ms!');
define('DB_CHARSET', 'utf8mb4');

/**
 * PDO Veritabanı Bağlantısı Oluşturur ve Gerekli Tabloları Otomatik Kurar
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

        // Tabloların Var Olduğunu Doğrula ve Otomatik Kur
        initDatabaseTables($pdo);

        return $pdo;
    } catch (PDOException $e) {
        // Eğer MySQL erişilemiyorsa JSON hata döndür
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error' => 'Veritabanı bağlantı hatası: ' . $e->getMessage(),
            'hint' => 'Lütfen db_config.php dosyasındaki MySQL kullanıcı adı ve şifresini kontrol edin.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/**
 * Otomatik Şema Oluşturucu
 */
function initDatabaseTables(PDO $pdo) {
    $tables = [
        "CREATE TABLE IF NOT EXISTS `company_settings` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `company_name` VARCHAR(255) NOT NULL DEFAULT 'YNR MAKİNE SAN. VE TİC. LTD. ŞTİ.',
            `title` VARCHAR(255) DEFAULT 'Endüstriyel Makine İmalatı & Otomasyon Sistemleri',
            `phone` VARCHAR(50) DEFAULT '+90 (212) 555 96 70',
            `address` TEXT,
            `tax_no` VARCHAR(100) DEFAULT '9840123982 / İkitelli V.D.',
            `default_overtime_multiplier` DECIMAL(4,2) DEFAULT 1.50,
            `sunday_overtime_multiplier` DECIMAL(4,2) DEFAULT 2.00,
            `holiday_overtime_multiplier` DECIMAL(4,2) DEFAULT 2.50,
            `working_hours_per_day` INT DEFAULT 8,
            `default_meal_allowance` DECIMAL(10,2) DEFAULT 150.00,
            `default_transport_allowance` DECIMAL(10,2) DEFAULT 80.00,
            `max_weekly_overtime_limit` INT DEFAULT 45,
            `active_currency` VARCHAR(10) DEFAULT 'TRY',
            `exchange_rate_usd` DECIMAL(10,4) DEFAULT 36.5000,
            `exchange_rate_eur` DECIMAL(10,4) DEFAULT 39.8000,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `branches` (
            `id` VARCHAR(50) PRIMARY KEY,
            `code` VARCHAR(50) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `city` VARCHAR(100) DEFAULT 'İstanbul',
            `address` TEXT,
            `manager_name` VARCHAR(150),
            `status` ENUM('ACTIVE', 'PASSIVE') DEFAULT 'ACTIVE',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `workers` (
            `id` VARCHAR(50) PRIMARY KEY,
            `code` VARCHAR(50) NOT NULL,
            `first_name` VARCHAR(100) NOT NULL,
            `last_name` VARCHAR(100) NOT NULL,
            `role` VARCHAR(150) NOT NULL,
            `daily_rate` DECIMAL(10,2) NOT NULL DEFAULT 1500.00,
            `overtime_hourly_rate` DECIMAL(10,2) NOT NULL DEFAULT 281.25,
            `phone` VARCHAR(50),
            `iban` VARCHAR(50),
            `department` VARCHAR(100) NOT NULL,
            `branch_id` VARCHAR(50),
            `status` ENUM('active', 'passive') DEFAULT 'active',
            `start_date` DATE,
            `tc_no` VARCHAR(20),
            `skill_level` VARCHAR(50) DEFAULT 'Operatör',
            `avatar_color` VARCHAR(100) DEFAULT 'from-amber-500 to-amber-700',
            `notes` TEXT,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `projects` (
            `id` VARCHAR(50) PRIMARY KEY,
            `code` VARCHAR(50) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `client` VARCHAR(255) NOT NULL,
            `start_date` DATE,
            `status` ENUM('ACTIVE', 'COMPLETED', 'PLANNED') DEFAULT 'ACTIVE',
            `budget` DECIMAL(12,2) DEFAULT 0.00,
            `branch_id` VARCHAR(50),
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `machinery` (
            `id` VARCHAR(50) PRIMARY KEY,
            `code` VARCHAR(50) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `category` VARCHAR(50) DEFAULT 'CNC',
            `status` ENUM('OPERATIONAL', 'MAINTENANCE', 'IDLE') DEFAULT 'OPERATIONAL',
            `hourly_operating_cost` DECIMAL(10,2) DEFAULT 500.00,
            `branch_id` VARCHAR(50),
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `attendance` (
            `id` VARCHAR(100) PRIMARY KEY,
            `worker_id` VARCHAR(50) NOT NULL,
            `date` DATE NOT NULL,
            `type` ENUM('FULL', 'HALF', 'LEAVE', 'REPORT', 'ABSENT', 'WEEKEND', 'WEEKEND_WORK') NOT NULL DEFAULT 'FULL',
            `overtime_hours` DECIMAL(4,2) DEFAULT 0.00,
            `overtime_multiplier` DECIMAL(4,2) DEFAULT 1.50,
            `shift` ENUM('DAY', 'NIGHT', 'WEEKEND') DEFAULT 'DAY',
            `project_id` VARCHAR(50),
            `machinery_id` VARCHAR(50),
            `branch_id` VARCHAR(50),
            `meal_allowance` DECIMAL(10,2) DEFAULT 150.00,
            `transport_allowance` DECIMAL(10,2) DEFAULT 80.00,
            `check_in_time` VARCHAR(10),
            `check_out_time` VARCHAR(10),
            `note` TEXT,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY `unique_worker_date` (`worker_id`, `date`),
            FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
            FOREIGN KEY (`machinery_id`) REFERENCES `machinery`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `advances` (
            `id` VARCHAR(50) PRIMARY KEY,
            `worker_id` VARCHAR(50) NOT NULL,
            `date` DATE NOT NULL,
            `amount` DECIMAL(10,2) NOT NULL,
            `type` ENUM('ADVANCE', 'BONUS', 'DEDUCTION', 'PAYROLL_SETTLEMENT') DEFAULT 'ADVANCE',
            `payment_method` ENUM('CASH', 'BANK') DEFAULT 'BANK',
            `description` TEXT,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `holidays` (
            `id` VARCHAR(50) PRIMARY KEY,
            `date` DATE NOT NULL UNIQUE,
            `name` VARCHAR(255) NOT NULL,
            `overtime_multiplier` DECIMAL(4,2) DEFAULT 2.50,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `disciplinary` (
            `id` VARCHAR(50) PRIMARY KEY,
            `worker_id` VARCHAR(50) NOT NULL,
            `date` DATE NOT NULL,
            `type` ENUM('PRAISE', 'WARNING', 'LATENESS', 'SAFETY_VIOLATION') NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `description` TEXT,
            `penalty_or_bonus_amount` DECIMAL(10,2) DEFAULT 0.00,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `audit_logs` (
            `id` VARCHAR(50) PRIMARY KEY,
            `timestamp` VARCHAR(50) NOT NULL,
            `user` VARCHAR(150) NOT NULL DEFAULT 'YNR Sistem Yöneticisi',
            `action` VARCHAR(100) NOT NULL,
            `category` ENUM('PUANTAJ', 'AVANS', 'PERSONEL', 'PROJE', 'AYARLAR') NOT NULL,
            `details` TEXT,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `users` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `username` VARCHAR(100) NOT NULL UNIQUE,
            `password_hash` VARCHAR(255) NOT NULL,
            `full_name` VARCHAR(150) NOT NULL DEFAULT 'YNR Sistem Yöneticisi',
            `role` ENUM('ADMIN', 'OPERATOR') DEFAULT 'ADMIN',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
    ];

    foreach ($tables as $sql) {
        $pdo->exec($sql);
    }

    // Mevcut attendance tablosunu yeni ENUM değerleri için güncelle
    try {
        $pdo->exec("ALTER TABLE `attendance` MODIFY COLUMN `type` ENUM('FULL', 'HALF', 'LEAVE', 'REPORT', 'ABSENT', 'WEEKEND', 'WEEKEND_WORK') NOT NULL DEFAULT 'FULL'");
    } catch (Exception $e) {
        // Ignore if already modified or no permission
    }

    // Varsayılan şirket ayarları yoksa ekle
    $checkSettings = $pdo->query("SELECT COUNT(*) FROM `company_settings`")->fetchColumn();
    if ($checkSettings == 0) {
        $pdo->exec("INSERT INTO `company_settings` (id, company_name, title, phone, address, tax_no) 
                    VALUES (1, 'YNR MAKİNE SAN. VE TİC. LTD. ŞTİ.', 'Endüstriyel Makine İmalatı & Otomasyon Sistemleri', '+90 (212) 555 96 70', 'İkitelli OSB Sanayi Sitesi No:42 Başakşehir / İstanbul', '9840123982 / İkitelli V.D.');");
    }

    // Varsayılan admin kullanıcısı yoksa ekle (Kullanıcı Adı: admin, Şifre: admin)
    $checkUsers = $pdo->query("SELECT COUNT(*) FROM `users`")->fetchColumn();
    if ($checkUsers == 0) {
        $defaultHash = password_hash('admin', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO `users` (username, password_hash, full_name, role) VALUES ('admin', :hash, 'YNR Sistem Yöneticisi', 'ADMIN')");
        $stmt->execute([':hash' => $defaultHash]);
    }
}
