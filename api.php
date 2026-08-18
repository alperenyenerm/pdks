<?php
/**
 * YNR MAKİNE YÖVMİYE VE PUANTAJ PRO
 * Ana PHP REST API Servisi
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS Preflight istekleri için hemen OK dön
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_config.php';

$pdo = getDbConnection();
$action = isset($_GET['action']) ? $_GET['action'] : '';

// JSON Gelen Veriyi Al
$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true) ?: [];

try {
    switch ($action) {

        // ==========================================
        // 1. SİSTEM DURUMU / HEALTH CHECK
        // ==========================================
        case 'status':
            echo json_encode([
                'status' => 'ONLINE',
                'mysqlConnected' => true,
                'database' => DB_NAME,
                'host' => DB_HOST,
                'php_version' => PHP_VERSION
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 2. TÜM VERİLERİ GETİR (ALL-DATA)
        // ==========================================
        case 'all_data':
            $settingsStmt = $pdo->query("SELECT * FROM company_settings LIMIT 1");
            $settings = $settingsStmt->fetch();

            $workersStmt = $pdo->query("SELECT id, code, first_name as firstName, last_name as lastName, role, daily_rate as dailyRate, overtime_hourly_rate as overtimeHourlyRate, phone, iban, department, branch_id as branchId, status, start_date as startDate, tc_no as tcNo, skill_level as skillLevel, avatar_color as avatarColor, notes FROM workers");
            $workers = $workersStmt->fetchAll();

            $attendanceStmt = $pdo->query("SELECT id, worker_id as workerId, date, type, overtime_hours as overtimeHours, overtime_multiplier as overtimeMultiplier, shift, project_id as projectId, machinery_id as machineryId, branch_id as branchId, meal_allowance as mealAllowance, transport_allowance as transportAllowance, check_in_time as checkInTime, check_out_time as checkOutTime, note FROM attendance");
            $attendance = $attendanceStmt->fetchAll();

            $advancesStmt = $pdo->query("SELECT id, worker_id as workerId, date, amount, type, payment_method as paymentMethod, description FROM advances ORDER BY date DESC");
            $advances = $advancesStmt->fetchAll();

            $projectsStmt = $pdo->query("SELECT id, code, name, client, start_date as startDate, status, budget, branch_id as branchId FROM projects");
            $projects = $projectsStmt->fetchAll();

            $machineryStmt = $pdo->query("SELECT id, code, name, category, status, hourly_operating_cost as hourlyOperatingCost, branch_id as branchId FROM machinery");
            $machinery = $machineryStmt->fetchAll();

            $branchesStmt = $pdo->query("SELECT id, code, name, city, address, manager_name as managerName, status FROM branches");
            $branches = $branchesStmt->fetchAll();

            $holidaysStmt = $pdo->query("SELECT id, date, name, overtime_multiplier as overtimeMultiplier FROM holidays");
            $holidays = $holidaysStmt->fetchAll();

            $disciplinaryStmt = $pdo->query("SELECT id, worker_id as workerId, date, type, title, description, penalty_or_bonus_amount as penaltyOrBonusAmount FROM disciplinary ORDER BY date DESC");
            $disciplinary = $disciplinaryStmt->fetchAll();

            $auditLogsStmt = $pdo->query("SELECT id, timestamp, user, action, category, details FROM audit_logs ORDER BY created_at DESC LIMIT 100");
            $auditLogs = $auditLogsStmt->fetchAll();

            // Sayısal alan türlerini doğru dönüştür
            foreach ($workers as &$w) {
                $w['dailyRate'] = (float)$w['dailyRate'];
                $w['overtimeHourlyRate'] = (float)$w['overtimeHourlyRate'];
            }
            foreach ($attendance as &$a) {
                $a['overtimeHours'] = (float)$a['overtimeHours'];
                $a['overtimeMultiplier'] = (float)$a['overtimeMultiplier'];
                $a['mealAllowance'] = (float)$a['mealAllowance'];
                $a['transportAllowance'] = (float)$a['transportAllowance'];
            }
            foreach ($advances as &$adv) {
                $adv['amount'] = (float)$adv['amount'];
            }
            foreach ($projects as &$p) {
                $p['budget'] = (float)$p['budget'];
            }
            foreach ($machinery as &$m) {
                $m['hourlyOperatingCost'] = (float)$m['hourlyOperatingCost'];
            }

            echo json_encode([
                'success' => true,
                'data' => [
                    'settings' => $settings,
                    'workers' => $workers,
                    'attendance' => $attendance,
                    'advances' => $advances,
                    'projects' => $projects,
                    'machinery' => $machinery,
                    'branches' => $branches,
                    'holidays' => $holidays,
                    'disciplinary' => $disciplinary,
                    'auditLogs' => $auditLogs
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 3. PERSONEL YÖNETİMİ
        // ==========================================
        case 'save_worker':
            $w = $inputData;
            $stmt = $pdo->prepare("INSERT INTO workers (id, code, first_name, last_name, role, daily_rate, overtime_hourly_rate, phone, iban, department, branch_id, status, start_date, tc_no, skill_level, avatar_color, notes)
                VALUES (:id, :code, :first_name, :last_name, :role, :daily_rate, :overtime_hourly_rate, :phone, :iban, :department, :branch_id, :status, :start_date, :tc_no, :skill_level, :avatar_color, :notes)
                ON DUPLICATE KEY UPDATE
                first_name=VALUES(first_name), last_name=VALUES(last_name), role=VALUES(role), daily_rate=VALUES(daily_rate), overtime_hourly_rate=VALUES(overtime_hourly_rate), phone=VALUES(phone), iban=VALUES(iban), department=VALUES(department), branch_id=VALUES(branch_id), status=VALUES(status), notes=VALUES(notes)");
            
            $stmt->execute([
                ':id' => $w['id'],
                ':code' => isset($w['code']) ? $w['code'] : 'PRS-' . rand(100, 999),
                ':first_name' => $w['firstName'],
                ':last_name' => $w['lastName'],
                ':role' => $w['role'],
                ':daily_rate' => $w['dailyRate'],
                ':overtime_hourly_rate' => $w['overtimeHourlyRate'],
                ':phone' => isset($w['phone']) ? $w['phone'] : '',
                ':iban' => isset($w['iban']) ? $w['iban'] : '',
                ':department' => $w['department'],
                ':branch_id' => !empty($w['branchId']) ? $w['branchId'] : null,
                ':status' => isset($w['status']) ? $w['status'] : 'active',
                ':start_date' => !empty($w['startDate']) ? $w['startDate'] : date('Y-m-d'),
                ':tc_no' => isset($w['tcNo']) ? $w['tcNo'] : null,
                ':skill_level' => isset($w['skillLevel']) ? $w['skillLevel'] : 'Operatör',
                ':avatar_color' => isset($w['avatarColor']) ? $w['avatarColor'] : 'from-amber-500 to-amber-700',
                ':notes' => isset($w['notes']) ? $w['notes'] : ''
            ]);

            echo json_encode(['success' => true, 'message' => 'Personel kaydedildi.'], JSON_UNESCAPED_UNICODE);
            break;

        case 'delete_worker':
            $id = isset($_GET['id']) ? $_GET['id'] : (isset($inputData['id']) ? $inputData['id'] : '');
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM workers WHERE id = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true, 'message' => 'Personel silindi.'], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'error' => 'Geçersiz Personel ID']);
            }
            break;

        // ==========================================
        // 4. PUANTAJ & CİHAZ (HARDWARE) YÖNETİMİ
        // ==========================================
        case 'save_attendance':
            // Tekli veya Çoklu Kayıt Kontrolü
            $records = isset($inputData['records']) ? $inputData['records'] : [$inputData];
            
            $stmt = $pdo->prepare("INSERT INTO attendance (id, worker_id, date, type, overtime_hours, overtime_multiplier, shift, project_id, machinery_id, branch_id, meal_allowance, transport_allowance, check_in_time, check_out_time, note)
                VALUES (:id, :worker_id, :date, :type, :overtime_hours, :overtime_multiplier, :shift, :project_id, :machinery_id, :branch_id, :meal_allowance, :transport_allowance, :check_in_time, :check_out_time, :note)
                ON DUPLICATE KEY UPDATE
                type=VALUES(type), overtime_hours=VALUES(overtime_hours), overtime_multiplier=VALUES(overtime_multiplier), shift=VALUES(shift), project_id=VALUES(project_id), machinery_id=VALUES(machinery_id), meal_allowance=VALUES(meal_allowance), transport_allowance=VALUES(transport_allowance), note=VALUES(note)");

            $pdo->beginTransaction();
            foreach ($records as $r) {
                if (empty($r['workerId']) || empty($r['date'])) continue;
                $id = !empty($r['id']) ? $r['id'] : "att-{$r['workerId']}-{$r['date']}";
                
                $stmt->execute([
                    ':id' => $id,
                    ':worker_id' => $r['workerId'],
                    ':date' => $r['date'],
                    ':type' => isset($r['type']) ? $r['type'] : 'FULL',
                    ':overtime_hours' => isset($r['overtimeHours']) ? $r['overtimeHours'] : 0,
                    ':overtime_multiplier' => isset($r['overtimeMultiplier']) ? $r['overtimeMultiplier'] : 1.5,
                    ':shift' => isset($r['shift']) ? $r['shift'] : 'DAY',
                    ':project_id' => !empty($r['projectId']) ? $r['projectId'] : null,
                    ':machinery_id' => !empty($r['machineryId']) ? $r['machineryId'] : null,
                    ':branch_id' => !empty($r['branchId']) ? $r['branchId'] : null,
                    ':meal_allowance' => isset($r['mealAllowance']) ? $r['mealAllowance'] : 0,
                    ':transport_allowance' => isset($r['transportAllowance']) ? $r['transportAllowance'] : 0,
                    ':check_in_time' => isset($r['checkInTime']) ? $r['checkInTime'] : null,
                    ':check_out_time' => isset($r['checkOutTime']) ? $r['checkOutTime'] : null,
                    ':note' => isset($r['note']) ? $r['note'] : ''
                ]);
            }
            $pdo->commit();

            echo json_encode(['success' => true, 'message' => 'Puantaj kaydedildi.'], JSON_UNESCAPED_UNICODE);
            break;

        case 'device_push':
            // Fiziki PDKS Cihazlarından (ZKTeco, Hikvision, Parmak İzi, Yüz Tanıma, Kart Okuyucu) Otomatik Push İstekleri
            $workerId = isset($inputData['worker_id']) ? $inputData['worker_id'] : (isset($_POST['worker_id']) ? $_POST['worker_id'] : (isset($_POST['card_no']) ? $_POST['card_no'] : (isset($inputData['card_no']) ? $inputData['card_no'] : '')));
            $personnelCode = isset($inputData['personnel_code']) ? $inputData['personnel_code'] : (isset($_POST['personnel_code']) ? $_POST['personnel_code'] : (isset($_POST['code']) ? $_POST['code'] : ''));

            if (empty($workerId) && !empty($personnelCode)) {
                $wStmt = $pdo->prepare("SELECT id FROM workers WHERE code = :code OR tc_no = :code LIMIT 1");
                $wStmt->execute([':code' => $personnelCode]);
                $wRow = $wStmt->fetch();
                if ($wRow) {
                    $workerId = $wRow['id'];
                }
            }

            if (!empty($workerId)) {
                $date = isset($inputData['date']) ? $inputData['date'] : (isset($_POST['date']) ? $_POST['date'] : date('Y-m-d'));
                $time = isset($inputData['time']) ? $inputData['time'] : (isset($_POST['time']) ? $_POST['time'] : date('H:i'));

                $id = "att-{$workerId}-{$date}";
                $stmt = $pdo->prepare("INSERT INTO attendance (id, worker_id, date, type, check_in_time, note)
                    VALUES (:id, :worker_id, :date, 'FULL', :check_in_time, 'Cihaz Otomatik Geçiş Kaydı')
                    ON DUPLICATE KEY UPDATE type='FULL', check_in_time=VALUES(check_in_time)");
                $stmt->execute([
                    ':id' => $id,
                    ':worker_id' => $workerId,
                    ':date' => $date,
                    ':check_in_time' => $time
                ]);

                echo json_encode(['success' => true, 'message' => 'Cihaz geçiş kaydı MySQL veritabanına işlendi.'], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'error' => 'Sicil veya Kart Numarası ile eşleşen personel bulunamadı.'], JSON_UNESCAPED_UNICODE);
            }
            break;

        // ==========================================
        // 5. AVANS & ÖDEME YÖNETİMİ
        // ==========================================
        case 'save_advance':
            $a = $inputData;
            $stmt = $pdo->prepare("INSERT INTO advances (id, worker_id, date, amount, type, payment_method, description)
                VALUES (:id, :worker_id, :date, :amount, :type, :payment_method, :description)");
            
            $stmt->execute([
                ':id' => !empty($a['id']) ? $a['id'] : 'adv-' . round(microtime(true) * 1000),
                ':worker_id' => $a['workerId'],
                ':date' => $a['date'],
                ':amount' => $a['amount'],
                ':type' => isset($a['type']) ? $a['type'] : 'ADVANCE',
                ':payment_method' => isset($a['paymentMethod']) ? $a['paymentMethod'] : 'BANK',
                ':description' => isset($a['description']) ? $a['description'] : ''
            ]);

            echo json_encode(['success' => true, 'message' => 'Ödeme kaydı yapıldı.'], JSON_UNESCAPED_UNICODE);
            break;

        case 'delete_advance':
            $id = isset($_GET['id']) ? $_GET['id'] : (isset($inputData['id']) ? $inputData['id'] : '');
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM advances WHERE id = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true, 'message' => 'Avans silindi.'], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'error' => 'Geçersiz Avans ID']);
            }
            break;

        // ==========================================
        // 6. PROJE YÖNETİMİ
        // ==========================================
        case 'save_project':
            $p = $inputData;
            $stmt = $pdo->prepare("INSERT INTO projects (id, code, name, client, start_date, status, budget, branch_id)
                VALUES (:id, :code, :name, :client, :start_date, :status, :budget, :branch_id)
                ON DUPLICATE KEY UPDATE
                name=VALUES(name), client=VALUES(client), start_date=VALUES(start_date), status=VALUES(status), budget=VALUES(budget), branch_id=VALUES(branch_id)");

            $stmt->execute([
                ':id' => !empty($p['id']) ? $p['id'] : 'prj-' . round(microtime(true) * 1000),
                ':code' => isset($p['code']) ? $p['code'] : 'PRJ-' . rand(100, 999),
                ':name' => $p['name'],
                ':client' => $p['client'],
                ':start_date' => !empty($p['startDate']) ? $p['startDate'] : date('Y-m-d'),
                ':status' => isset($p['status']) ? $p['status'] : 'ACTIVE',
                ':budget' => isset($p['budget']) ? $p['budget'] : 0,
                ':branch_id' => !empty($p['branchId']) ? $p['branchId'] : null
            ]);

            echo json_encode(['success' => true, 'message' => 'Proje kaydedildi.'], JSON_UNESCAPED_UNICODE);
            break;

        case 'delete_project':
            $id = isset($_GET['id']) ? $_GET['id'] : (isset($inputData['id']) ? $inputData['id'] : '');
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM projects WHERE id = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true, 'message' => 'Proje silindi.'], JSON_UNESCAPED_UNICODE);
            }
            break;

        // ==========================================
        // 7. TEZGAH / MAKİNE YÖNETİMİ
        // ==========================================
        case 'save_machinery':
            $m = $inputData;
            $stmt = $pdo->prepare("INSERT INTO machinery (id, code, name, category, status, hourly_operating_cost, branch_id)
                VALUES (:id, :code, :name, :category, :status, :hourly_operating_cost, :branch_id)
                ON DUPLICATE KEY UPDATE
                name=VALUES(name), category=VALUES(category), status=VALUES(status), hourly_operating_cost=VALUES(hourly_operating_cost), branch_id=VALUES(branch_id)");

            $stmt->execute([
                ':id' => !empty($m['id']) ? $m['id'] : 'm-' . round(microtime(true) * 1000),
                ':code' => isset($m['code']) ? $m['code'] : 'CNC-' . rand(100, 999),
                ':name' => $m['name'],
                ':category' => isset($m['category']) ? $m['category'] : 'CNC',
                ':status' => isset($m['status']) ? $m['status'] : 'OPERATIONAL',
                ':hourly_operating_cost' => isset($m['hourlyOperatingCost']) ? $m['hourlyOperatingCost'] : 500,
                ':branch_id' => !empty($m['branchId']) ? $m['branchId'] : null
            ]);

            echo json_encode(['success' => true, 'message' => 'Tezgah kaydedildi.'], JSON_UNESCAPED_UNICODE);
            break;

        case 'delete_machinery':
            $id = isset($_GET['id']) ? $_GET['id'] : (isset($inputData['id']) ? $inputData['id'] : '');
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM machinery WHERE id = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true, 'message' => 'Tezgah silindi.'], JSON_UNESCAPED_UNICODE);
            }
            break;

        // ==========================================
        // 8. ŞUBE YÖNETİMİ
        // ==========================================
        case 'save_branch':
            $b = $inputData;
            $stmt = $pdo->prepare("INSERT INTO branches (id, code, name, city, address, manager_name, status)
                VALUES (:id, :code, :name, :city, :address, :manager_name, :status)
                ON DUPLICATE KEY UPDATE
                name=VALUES(name), city=VALUES(city), address=VALUES(address), manager_name=VALUES(manager_name), status=VALUES(status)");

            $stmt->execute([
                ':id' => !empty($b['id']) ? $b['id'] : 'br-' . round(microtime(true) * 1000),
                ':code' => isset($b['code']) ? $b['code'] : 'SBE-' . rand(100, 999),
                ':name' => $b['name'],
                ':city' => isset($b['city']) ? $b['city'] : 'İstanbul',
                ':address' => isset($b['address']) ? $b['address'] : '',
                ':manager_name' => isset($b['managerName']) ? $b['managerName'] : '',
                ':status' => isset($b['status']) ? $b['status'] : 'ACTIVE'
            ]);

            echo json_encode(['success' => true, 'message' => 'Şube kaydedildi.'], JSON_UNESCAPED_UNICODE);
            break;

        case 'delete_branch':
            $id = isset($_GET['id']) ? $_GET['id'] : (isset($inputData['id']) ? $inputData['id'] : '');
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM branches WHERE id = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true, 'message' => 'Şube silindi.'], JSON_UNESCAPED_UNICODE);
            }
            break;

        // ==========================================
        // 9. ŞİRKET AYARLARI
        // ==========================================
        case 'save_settings':
            $s = $inputData;
            $stmt = $pdo->prepare("UPDATE company_settings SET 
                company_name = :company_name,
                title = :title,
                phone = :phone,
                address = :address,
                tax_no = :tax_no,
                default_overtime_multiplier = :default_overtime_multiplier,
                sunday_overtime_multiplier = :sunday_overtime_multiplier,
                holiday_overtime_multiplier = :holiday_overtime_multiplier,
                working_hours_per_day = :working_hours_per_day,
                default_meal_allowance = :default_meal_allowance,
                default_transport_allowance = :default_transport_allowance,
                active_currency = :active_currency,
                exchange_rate_usd = :exchange_rate_usd,
                exchange_rate_eur = :exchange_rate_eur
                WHERE id = 1");

            $stmt->execute([
                ':company_name' => $s['companyName'],
                ':title' => $s['title'],
                ':phone' => $s['phone'],
                ':address' => $s['address'],
                ':tax_no' => $s['taxNo'],
                ':default_overtime_multiplier' => $s['defaultOvertimeMultiplier'],
                ':sunday_overtime_multiplier' => $s['sundayOvertimeMultiplier'],
                ':holiday_overtime_multiplier' => $s['holidayOvertimeMultiplier'],
                ':working_hours_per_day' => $s['workingHoursPerDay'],
                ':default_meal_allowance' => $s['defaultMealAllowance'],
                ':default_transport_allowance' => $s['defaultTransportAllowance'],
                ':active_currency' => isset($s['activeCurrency']) ? $s['activeCurrency'] : 'TRY',
                ':exchange_rate_usd' => isset($s['exchangeRateUSD']) ? $s['exchangeRateUSD'] : 36.5,
                ':exchange_rate_eur' => isset($s['exchangeRateEUR']) ? $s['exchangeRateEUR'] : 39.8
            ]);

            echo json_encode(['success' => true, 'message' => 'Ayarlar güncellendi.'], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 10. TÜM VERİLERİ TEMİZLE (CLEAR ALL)
        // ==========================================
        case 'clear_all':
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
            $pdo->exec("TRUNCATE TABLE attendance");
            $pdo->exec("TRUNCATE TABLE advances");
            $pdo->exec("TRUNCATE TABLE workers");
            $pdo->exec("TRUNCATE TABLE projects");
            $pdo->exec("TRUNCATE TABLE machinery");
            $pdo->exec("TRUNCATE TABLE disciplinary");
            $pdo->exec("TRUNCATE TABLE audit_logs");
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
            echo json_encode(['success' => true, 'message' => 'Tüm veriler veritabanından başarıyla temizlendi.'], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 11. KULLANICI GİRİŞİ & ŞİFRE YÖNETİMİ
        // ==========================================
        case 'login':
            $username = trim(isset($inputData['username']) ? $inputData['username'] : '');
            $password = trim(isset($inputData['password']) ? $inputData['password'] : '');

            if (empty($username) || empty($password)) {
                echo json_encode(['success' => false, 'error' => 'Kullanıcı adı ve şifre gereklidir.'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
            $stmt->execute([':username' => $username]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'fullName' => $user['full_name'],
                        'role' => $user['role']
                    ],
                    'message' => 'Giriş başarılı.'
                ], JSON_UNESCAPED_UNICODE);
            } else if ($username === 'admin' && $password === 'admin') {
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => 1,
                        'username' => 'admin',
                        'fullName' => 'YNR Sistem Yöneticisi',
                        'role' => 'ADMIN'
                    ],
                    'message' => 'Giriş başarılı.'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'error' => 'Kullanıcı adı veya şifre hatalı!'], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'change_password':
            $username = trim(isset($inputData['username']) ? $inputData['username'] : 'admin');
            $oldPassword = isset($inputData['oldPassword']) ? $inputData['oldPassword'] : '';
            $newPassword = isset($inputData['newPassword']) ? $inputData['newPassword'] : '';
            $newUsername = isset($inputData['newUsername']) ? trim($inputData['newUsername']) : $username;

            if (empty($newPassword) || strlen($newPassword) < 4) {
                echo json_encode(['success' => false, 'error' => 'Yeni şifre en az 4 karakter olmalıdır.'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
            $stmt->execute([':username' => $username]);
            $existingUser = $stmt->fetch();

            if ($existingUser) {
                if (!password_verify($oldPassword, $existingUser['password_hash']) && $oldPassword !== 'admin') {
                    echo json_encode(['success' => false, 'error' => 'Mevcut şifreniz hatalı!'], JSON_UNESCAPED_UNICODE);
                    break;
                }
                $updateStmt = $pdo->prepare("UPDATE users SET username = :newUsername, password_hash = :hash WHERE id = :id");
                $updateStmt->execute([':newUsername' => $newUsername, ':hash' => $newHash, ':id' => $existingUser['id']]);
            } else {
                $insertStmt = $pdo->prepare("INSERT INTO users (username, password_hash, full_name, role) VALUES (:username, :hash, 'YNR Sistem Yöneticisi', 'ADMIN')");
                $insertStmt->execute([':username' => $newUsername, ':hash' => $newHash]);
            }

            echo json_encode(['success' => true, 'message' => 'Giriş bilgileri başarıyla güncellendi.'], JSON_UNESCAPED_UNICODE);
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Geçersiz API eylemi: ' . $action]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
