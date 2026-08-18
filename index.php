<?php
/**
 * YNR MAKİNE YÖVMİYE VE PUANTAJ PRO
 * PHP Ana Giriş & Web Sunucu Başlatıcı
 */

// Sistem Gereksinimlerini ve PHP Sürümünü Kontrol Et
if (version_compare(PHP_VERSION, '7.4.0', '<')) {
    die('<div style="font-family:sans-serif; padding:20px; background:#fee2e2; color:#991b1b; border-radius:8px; margin:40px auto; max-width:600px;">' .
        '<h2>⚠️ PHP Sürüm Uyarısı</h2>' .
        '<p>Yövmiye ve Puantaj PRO minimum PHP 7.4+ sürümü gerektirir. Mevcut PHP Sürümünüz: ' . PHP_VERSION . '</p>' .
        '</div>');
}

// Eğer dist/index.html varsa onu yükle, yoksa yerel index.html dosyasını yükle
$htmlPath = __DIR__ . '/dist/index.html';
$isDistSubfolder = true;

if (!file_exists($htmlPath)) {
    $htmlPath = __DIR__ . '/index.html';
    $isDistSubfolder = false;
}

if (file_exists($htmlPath)) {
    $content = file_get_contents($htmlPath);
    
    // Eğer dist alt klasöründen çağrılıyorsa asset yollarını dist/assets olarak güncelle
    if ($isDistSubfolder && file_exists(__DIR__ . '/dist/assets')) {
        $content = str_replace('href="./assets/', 'href="dist/assets/', $content);
        $content = str_replace('src="./assets/', 'src="dist/assets/', $content);
        $content = str_replace('href="/assets/', 'href="dist/assets/', $content);
        $content = str_replace('src="/assets/', 'src="dist/assets/', $content);
        $content = str_replace('href="assets/', 'href="dist/assets/', $content);
        $content = str_replace('src="assets/', 'src="dist/assets/', $content);
    }
    
    echo $content;
} else {
    echo '<div style="font-family:sans-serif; padding:30px; text-align:center; background:#1e293b; color:#fff; min-height:100vh;">' .
         '<h1>YNR Makine Yövmiye ve Puantaj PRO</h1>' .
         '<p style="color:#94a3b8;">Derlenmiş web arayüzü dosyası (index.html) henüz oluşturulmadı.</p>' .
         '<p>Lütfen projenizde <code>npm run build</code> komutunu çalıştırıp üretilen dosyaları yükleyin.</p>' .
         '</div>';
}
