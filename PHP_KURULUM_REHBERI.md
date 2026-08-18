# YÖVMİYE VE PUANTAJ PRO - PHP & MYSQL WEB SUNUCUSU KURULUM REHBERİ

Bu rehber, **Yövmiye ve Puantaj PRO** uygulamasını kendi web sitenizde (cPanel, Plesk, DirectAdmin veya FTP üzerinden herhangi bir PHP web hosting) adım adım nasıl yayına alacağınızı anlatmaktadır.

---

## 📋 Sistem Gereksinimleri

- **PHP Sürümü:** PHP 7.4, 8.0, 8.1, 8.2 veya 8.3+
- **Veritabanı:** MySQL 5.7+ veya MariaDB 10.3+
- **PHP Eklentileri:** `pdo`, `pdo_mysql`, `json` (tüm standart hosting paketlerinde varsayılan olarak aktiftir)
- **Web Sunucu:** Apache veya Nginx

---

## 🚀 Adım Adım Web Sitenize Kurulum

### 1. Adım: MySQL Veritabanı Oluşturma (cPanel / Plesk)
1. Hosting yönetim panelinize (cPanel / Plesk vb.) giriş yapın.
2. **MySQL Veritabanı Sihirbazı** (MySQL Databases) bölümüne girin.
3. Yeni bir veritabanı oluşturun (örneğin: `kullaniciadi_puantaj`).
4. Bir veritabanı kullanıcısı ve güçlü bir şifre oluşturup kullanıcılara **Tüm Yetkileri (ALL PRIVILEGES)** verin.

---

### 2. Adım: Veritabanı Bilgilerini `db_config.php` Dosyasına Girme
Proje dizininde yer alan `db_config.php` dosyasını bir metin düzenleyici ile açın ve veritabanı bilgilerinizi yazın:

```php
define('DB_HOST', 'localhost'); // Genellikle localhost kalır
define('DB_PORT', '3306');
define('DB_NAME', 'kullaniciadi_puantaj'); // Oluşturduğunuz DB adı
define('DB_USER', 'kullaniciadi_dbuser');  // Oluşturduğunuz DB kullanıcısı
define('DB_PASS', 'Sifreniz123!');         // DB Kullanıcı Şifresi
```

> 💡 **Otomatik Tablo Kurulumu:** Tabloları elle içe aktarmanıza (`import`) gerek yoktur! Sistem `db_config.php` ile bağlandığı anda gerekli tüm tabloları (`workers`, `attendance`, `advances`, `projects`, `machinery`, `branches`, `company_settings` vb.) otomatik olarak oluşturacaktır.

---

### 3. Adım: Dosyaları Web Sunucunuza Yükleme
1. Bilgisayarınızda proje dizinindeki tüm dosyaları (veya `npm run build` ile oluşan `dist` klasöründeki çıktıları) seçin.
2. FTP programı (FileZilla, WinSCP vb.) veya cPanel **Dosya Yöneticisi (File Manager)** ile web sitenizin ilgili klasörüne yükleyin:
   - Ana alanda çalıştırmak için: `public_html/`
   - Alt klasörde çalıştırmak için: `public_html/puantaj/`
3. Yüklenecek Kritik Dosyalar:
   - `index.php`
   - `db_config.php`
   - `api.php`
   - `.htaccess`
   - `dist/` klasörü veya derlenmiş `assets/`, `index.html` dosyaları.

---

### 4. Adım: Web Sitenizi Açın ve Test Edin!
Tarayıcınızdan domain adresinizi ziyaret edin (örneğin: `https://www.siteniz.com` veya `https://www.siteniz.com/puantaj`).

- Sistem açıldığında veritabanına otomatik bağlanacak ve hazır hale gelecektir.
- Personel ekleme, puantaj girme, avans ve proje işlemlerini yapıp test edebilirsiniz.
- Tüm verileriniz sunucunuzdaki MySQL veritabanına güvenle kaydedilecektir.

---

## 🛠️ Sorun Giderme (Troubleshooting)

### Q: "Veritabanı bağlantı hatası" alıyorum?
- `db_config.php` dosyasındaki `DB_NAME`, `DB_USER` ve `DB_PASS` bilgilerini doğru yazdığınızdan emin olun.
- Hosting firmanız özel bir MySQL Host adresi gerektiriyorsa `DB_HOST` değerini güncelleyin (örn: `mysql.siteniz.com`).

### Q: "404 Not Found" veya API istekleri başarısız oluyor?
- Web sunucunuzda Apache `mod_rewrite` eklentisinin açık olduğundan ve `.htaccess` dosyasının yüklendiğinden emin olun.

---

### 🎉 Tebrikler! Yövmiye ve Puantaj PRO sisteminiz web sitenizde doğrudan canlıda çalışıyor.
