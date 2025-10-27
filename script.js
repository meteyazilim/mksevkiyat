// =========================================================
// YARDIMCI VE İLK BAŞLANGIÇ FONKSİYONLARI
// =========================================================

function initUsers() {
    // Local Storage'da users objesi yoksa varsayılan admini ekle
    if (!localStorage.getItem('users')) {
        const defaultUser = {
            'admin@mkenr.com': { 
                ad: 'Süper', 
                soyad: 'Admin', 
                telefon: '500-111-22-33', 
                email: 'admin@mkenr.com', 
                password: '123' 
            }
        };
        localStorage.setItem('users', JSON.stringify(defaultUser));
    }
}

initUsers();

// Hata mesajlarını göster/gizle
function showError(elementId, message) {
    const errorSpan = document.getElementById(`error-${elementId}`);
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.classList.add('show');
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(span => {
        span.textContent = '';
        span.classList.remove('show');
    });
}

// Tarihi YYYY-MM-DD formatına çevirir
function formatToStandardDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
}

// Base64 verisini alıp küçültülmüş bir resim objesi döndürür
function createPreviewImage(base64Data) {
    const img = document.createElement('img');
    img.src = base64Data;
    img.alt = 'Önizleme';
    return img;
}

// CSV / EXCEL İHRACAT FONKSİYONLARI
function convertToCSV(data) {
    const headers = ["Kod", "Plaka", "Teslim Eden", "Teslim Alan", "Tarih", "Telefon", "Görsel Sayısı"];
    let csv = headers.join(";") + "\n"; 
    
    Object.keys(data).sort().forEach(kod => {
        const item = data[kod];
        const row = [
            `"${kod}"`,
            `"${item.plaka}"`,
            `"${item.teslimEden}"`,
            `"${item.teslimAlan}"`,
            `"${item.tarih}"`,
            `"${item.telefon || '-'}"`,
            `"${item.gorseller ? item.gorseller.length : 0}"`
        ];
        csv += row.join(";") + "\n";
    });
    return csv;
}

function downloadFile(data, filename, type) {
    const blob = new Blob([data], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// =========================================================
// GİRİŞ KONTROL VE LOGOUT İŞLEMLERİ (Tüm Sayfalar İçin)
// =========================================================

const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}

// Admin ve Ayarlar sayfalarına yetkisiz erişimi engelleme
if (window.location.pathname.endsWith('admin.html') || window.location.pathname.endsWith('settings.html')) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}


// =========================================================
// KULLANICI KAYDI (register.html)
// =========================================================

const registerForm = document.getElementById('register-formu');

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const ad = document.getElementById('regAd').value.trim();
        const soyad = document.getElementById('regSoyad').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const telefon = document.getElementById('regTelefon').value.trim();
        const password = document.getElementById('regSifre').value;

        let isValid = true;
        let users = JSON.parse(localStorage.getItem('users')) || {};

        if (users[email]) {
            showError('regEmail', 'Bu e-posta adresi zaten kayıtlıdır.');
            isValid = false;
        }
        if (password.length < 6) {
            showError('regSifre', 'Şifre en az 6 karakter olmalıdır.');
            isValid = false;
        }

        if (!isValid) return;

        users[email] = { ad, soyad, telefon, email, password };
        localStorage.setItem('users', JSON.stringify(users));

        alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
        window.location.href = 'login.html';
    });
}


// =========================================================
// KULLANICI GİRİŞİ (login.html)
// =========================================================

const loginForm = document.getElementById('login-formu');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('kullaniciAdi').value.trim().toLowerCase();
        const password = document.getElementById('sifre').value;
        
        const users = JSON.parse(localStorage.getItem('users')) || {};

        if (users[email] && users[email].password === password) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', email);
            window.location.href = 'admin.html';
        } else {
            alert('Hatalı e-posta veya şifre.');
        }
    });
}

// =========================================================
// KULLANICI AYARLARI (settings.html)
// =========================================================

const settingsForm = document.getElementById('settings-formu');

if (settingsForm) {
    const currentUserEmail = localStorage.getItem('currentUser');
    
    // Form elemanlarını doldur
    function loadUserSettings() {
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users[currentUserEmail];
        
        if (user) {
            document.getElementById('settingsAd').value = user.ad;
            document.getElementById('settingsSoyad').value = user.soyad;
            document.getElementById('settingsEmail').value = user.email;
            document.getElementById('settingsTelefon').value = user.telefon;
        } else {
             // Kullanıcı yoksa login'e yönlendir (güvenlik)
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    }
    
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();
        
        let users = JSON.parse(localStorage.getItem('users'));
        let user = users[currentUserEmail];
        let isValid = true;
        
        const ad = document.getElementById('settingsAd').value.trim();
        const soyad = document.getElementById('settingsSoyad').value.trim();
        const telefon = document.getElementById('settingsTelefon').value.trim();
        const newPassword = document.getElementById('settingsNewSifre').value;
        
        // Şifre kontrolü
        if (newPassword && newPassword.length < 6) {
            showError('settingsNewSifre', 'Yeni şifre en az 6 karakter olmalıdır.');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Kullanıcı bilgilerini güncelle
        user.ad = ad;
        user.soyad = soyad;
        user.telefon = telefon;
        
        // Şifre güncelleniyorsa
        if (newPassword) {
            user.password = newPassword;
            document.getElementById('settingsNewSifre').value = ''; // Alanı temizle
        }

        // Local Storage'ı kaydet
        users[currentUserEmail] = user;
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('Kullanıcı bilgileriniz başarıyla güncellendi!');
    });

    window.addEventListener('load', loadUserSettings);
}


// =========================================================
// ADMIN SAYFASI (admin.html) KODU (Sevkiyat Yönetimi)
// =========================================================

const sevkiyatForm = document.getElementById('sevkiyat-formu');
// ADMIN SAYFASI (admin.html) KODU bloğu içinde
// ... (Diğer değişken tanımlamaları) ...

if (sevkiyatForm) {
    // ... (Diğer değişken tanımlamaları) ...
    const userManagementLink = document.getElementById('user-management-link');
    const currentUserEmail = localStorage.getItem('currentUser');

    // Sadece varsayılan admin e-postası ise (admin@mkenr.com) linki göster
    if (userManagementLink && currentUserEmail === 'admin@mkenr.com') {
        userManagementLink.style.display = 'block';
    }
    
    // ... (Geri kalan sevkiyat yönetimi kodları) ...
}
if (sevkiyatForm) {
    const gorsellerInput = document.getElementById('gorseller');
    const gorselOnizlemeDiv = document.getElementById('gorsel-onizleme');
    const menuToggleBtn = document.getElementById('menu-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const modal = document.getElementById('sevkiyat-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');
    const aramaInput = document.getElementById('aramaInput');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const exportExcelBtn = document.getElementById('export-excel-btn');
    
    let isNewEntry = true;
    let currentEditKod = null;

    // ===================================================
    // HAMBURGER MENÜ DÜZENLEMESİ (Sadece bu kısım güncellendi)
    // ===================================================
    menuToggleBtn.addEventListener('click', (e) => { // e parametresini ekle
        e.stopPropagation(); // Tıklama olayının sayfanın diğer elementlerine yayılmasını engeller
        dropdownMenu.classList.toggle('show');
    });

    // Menü dışına tıklayınca kapatma
    window.addEventListener('click', (e) => {
        // e.target.closest ile menü butonu ve menü içeriğine tıklanma kontrolü
        if (!e.target.closest('.admin-nav-menu') && dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    });
    // ===================================================

    // GÖRSEL ÖNİZLEME (Aynı kaldı)
    gorsellerInput.addEventListener('change', () => {
        gorselOnizlemeDiv.innerHTML = ''; 
        const files = gorsellerInput.files;

        if (files.length === 0) return;
        
        Array.from(files).slice(0, 4).forEach(file => { 
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = createPreviewImage(e.target.result);
                gorselOnizlemeDiv.appendChild(img);
            };
            reader.readAsDataURL(file); 
        });
    });

    // KAYIT/GÜNCELLEME İŞLEMİ (Aynı kaldı)
    sevkiyatForm.addEventListener('submit', handleSevkiyatSubmit);
    
    function handleSevkiyatSubmit(e) {
        e.preventDefault(); 
        clearErrors(); 
        
        let isValid = true;
        // ... (Zorunlu alan kontrol ve görsel yükleme kodları aynı kaldı) ...
        
        const sevkiyatKoduInput = document.getElementById('sevkiyatKodu');
        const sevkiyatKodu = sevkiyatKoduInput.value.toUpperCase().trim();
        const plaka = document.getElementById('plaka').value.toUpperCase().trim();
        const teslimEden = document.getElementById('teslimEden').value.trim();
        const teslimAlan = document.getElementById('teslimAlan').value.trim();
        const tarih = document.getElementById('tarih').value.trim();
        const telefon = document.getElementById('telefon').value.trim();
        let gorseller = gorsellerInput.files;
        
        // Zorunlu Alan Kontrolü
        if (!sevkiyatKodu) { showError('sevkiyatKodu', 'Sevkiyat Kodu zorunludur.'); isValid = false; }
        if (!plaka) { showError('plaka', 'Plaka zorunludur.'); isValid = false; }
        if (!teslimEden) { showError('teslimEden', 'Teslim Eden zorunludur.'); isValid = false; }
        if (!teslimAlan) { showError('teslimAlan', 'Teslim Alan zorunludur.'); isValid = false; }
        if (!tarih) { showError('tarih', 'Tarih zorunludur.'); isValid = false; }
        
        // Görsel Kontrolü
        const fileCount = gorseller.length;
        let sevkiyatlar = JSON.parse(localStorage.getItem('sevkiyatlar')) || {};
        
        if (isNewEntry || fileCount > 0) {
            if (fileCount === 0 && isNewEntry) { 
                showError('gorseller', 'En az bir adet teslimat görseli yüklemek zorunludur.');
                isValid = false;
            }
            if (fileCount > 4) {
                showError('gorseller', `Maksimum 4 adet görsel yükleyebilirsiniz. Şu an ${fileCount} görsel seçildi.`);
                isValid = false;
            }
        }
        
        if (!isValid) return;
        
        
        if (isNewEntry && sevkiyatlar[sevkiyatKodu]) {
            showError('sevkiyatKodu', `Hata: ${sevkiyatKodu} kodu zaten kayıtlı.`);
            return; 
        }

        let filePromises = [];
        let gorselVerileri = [];
        const isFileSelected = fileCount > 0;
        
        if (isFileSelected) {
            filePromises = Array.from(gorseller).slice(0, 4).map(file => {
                return new Promise((resolve, reject) => {
                    if (file.size > 1024 * 1024) { 
                        reject(new Error(`"${file.name}" dosyası 1MB'dan büyük.`));
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result); 
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(file);
                });
            });
        } else if (!isNewEntry && sevkiyatlar[sevkiyatKodu]) {
            gorselVerileri = sevkiyatlar[sevkiyatKodu].gorseller || [];
        }


        Promise.all(filePromises)
            .then(yeniGorselVerileri => {
                
                if (isFileSelected) {
                    gorselVerileri = yeniGorselVerileri;
                }
                
                const yeniSevkiyat = {
                    plaka,
                    teslimEden,
                    teslimAlan,
                    tarih: formatToStandardDate(tarih), 
                    telefon,
                    gorseller: gorselVerileri
                };

                sevkiyatlar[sevkiyatKodu] = yeniSevkiyat;
                localStorage.setItem('sevkiyatlar', JSON.stringify(sevkiyatlar));

                alert(`Sevkiyat Kodu: ${sevkiyatKodu} başarıyla ${isNewEntry ? 'kaydedildi' : 'güncellendi'}!`);
                
                resetFormToCreateMode(); 
                renderSevkiyatListesi(); 
            })
            .catch(error => {
                alert(`Görsel Yükleme Hatası: ${error.message}`);
                console.error(error);
            });
    }

    function resetFormToCreateMode() {
        sevkiyatForm.reset(); 
        gorselOnizlemeDiv.innerHTML = '';
        document.getElementById('sevkiyatKodu').readOnly = false;
        document.getElementById('gorseller').value = ''; 
        
        document.getElementById('submit-btn').textContent = 'Sevkiyatı Kaydet';
        isNewEntry = true;
        currentEditKod = null;
        clearErrors();
    }


    // LİSTELEME, DÜZENLEME, SİLME ve FİLTRELEME İŞLEMLERİ (Aynı kaldı)
    function renderSevkiyatListesi(filtreMetni = '') {
        const sevkiyatlar = JSON.parse(localStorage.getItem('sevkiyatlar')) || {};
        const tbody = document.querySelector('#sevkiyat-tablosu tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        const siraliKodlar = Object.keys(sevkiyatlar).sort();
        
        siraliKodlar.forEach(kod => {
            const sevkiyat = sevkiyatlar[kod];
            const aramaAlani = `${kod} ${sevkiyat.plaka} ${sevkiyat.teslimAlan} ${sevkiyat.teslimEden}`.toUpperCase();
            
            if (filtreMetni && !aramaAlani.includes(filtreMetni.toUpperCase())) {
                return; 
            }
            
            const row = tbody.insertRow();
            
            row.insertCell().textContent = kod;
            row.insertCell().textContent = sevkiyat.plaka;
            row.insertCell().textContent = sevkiyat.teslimEden;
            row.insertCell().textContent = sevkiyat.tarih;
            
            const actionCell = row.insertCell();
            actionCell.classList.add('action-buttons');
            
            const viewBtn = document.createElement('button');
            viewBtn.textContent = 'Detay Gör';
            viewBtn.classList.add('secondary-button');
            viewBtn.style.backgroundColor = '#007bff';
            viewBtn.style.color = 'white';
            viewBtn.onclick = () => showSevkiyatDetailsModal(kod, sevkiyat);
            actionCell.appendChild(viewBtn);

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Düzenle';
            editBtn.onclick = () => editSevkiyat(kod);
            editBtn.classList.add('secondary-button');
            actionCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Sil';
            deleteBtn.onclick = () => deleteSevkiyat(kod);
            actionCell.appendChild(deleteBtn);
        });
    }

    function deleteSevkiyat(kod) {
        if (confirm(`${kod} kodlu sevkiyatı silmek istediğinizden emin misiniz?`)) {
            let sevkiyatlar = JSON.parse(localStorage.getItem('sevkiyatlar')) || {};
            delete sevkiyatlar[kod];
            localStorage.setItem('sevkiyatlar', JSON.stringify(sevkiyatlar));
            
            if (currentEditKod === kod) {
                resetFormToCreateMode();
            }
            
            alert(`${kod} kodlu sevkiyat silindi.`);
            renderSevkiyatListesi(aramaInput.value); 
        }
    }
    
    function editSevkiyat(kod) {
        let sevkiyatlar = JSON.parse(localStorage.getItem('sevkiyatlar'));
        const sevkiyat = sevkiyatlar[kod];
        
        sevkiyatForm.reset(); 
        clearErrors(); 
        gorselOnizlemeDiv.innerHTML = '';
        
        isNewEntry = false;
        currentEditKod = kod;

        document.getElementById('sevkiyatKodu').value = kod;
        document.getElementById('sevkiyatKodu').readOnly = true; 
        
        document.getElementById('plaka').value = sevkiyat.plaka;
        document.getElementById('teslimEden').value = sevkiyat.teslimEden;
        document.getElementById('teslimAlan').value = sevkiyat.teslimAlan;
        document.getElementById('tarih').value = sevkiyat.tarih; 
        document.getElementById('telefon').value = sevkiyat.telefon;

        if(sevkiyat.gorseller) {
             sevkiyat.gorseller.forEach(base64 => {
                gorselOnizlemeDiv.appendChild(createPreviewImage(base64));
            });
        }
       
        document.getElementById('submit-btn').textContent = `Sevkiyatı Güncelle (${kod})`;
        
        window.scrollTo(0, 0); 
    }
    
    // MODAL İŞLEMLERİ (Aynı kaldı)
    function showSevkiyatDetailsModal(kod, sevkiyat) {
        let gorselHTML;
        if (!sevkiyat.gorseller || sevkiyat.gorseller.length === 0) {
            gorselHTML = '<p style="color:var(--color-text-medium);">Bu sevkiyata ait görsel bulunmamaktadır.</p>';
        } else {
            gorselHTML = sevkiyat.gorseller.map(base64 => 
                `<img src="${base64}" alt="Sevkiyat Görseli">`
            ).join('');
        }
    
        modalBody.innerHTML = `
            <h2>Sevkiyat Detayları: ${kod}</h2>
            <p><strong>Plaka:</strong> ${sevkiyat.plaka}</p>
            <p><strong>Teslim Eden:</strong> ${sevkiyat.teslimEden}</p>
            <p><strong>Teslim Alan:</strong> ${sevkiyat.teslimAlan}</p>
            <p><strong>Tarih:</strong> ${sevkiyat.tarih}</p>
            <p><strong>Telefon:</strong> ${sevkiyat.telefon || 'Belirtilmemiş'}</p>
            <hr>
            <h3>Teslimat Görselleri (${sevkiyat.gorseller ? sevkiyat.gorseller.length : 0} Adet)</h3>
            <div class="gorsel-galeri">
                ${gorselHTML}
            </div>
        `;
        modal.style.display = 'block';
    }
    closeBtn.onclick = () => { modal.style.display = 'none'; }
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // ARAMA/FİLTRELEME İŞLEMLERİ (Aynı kaldı)
    aramaInput.addEventListener('keyup', () => {
        renderSevkiyatListesi(aramaInput.value);
    });

    // DIŞA AKTARMA (EXPORT) İŞLEMLERİ (Aynı kaldı)
    exportCsvBtn.addEventListener('click', () => {
        const sevkiyatlar = JSON.parse(localStorage.getItem('sevkiyatlar')) || {};
        const csvData = convertToCSV(sevkiyatlar);
        downloadFile(csvData, 'sevkiyat_listesi.csv', 'text/csv;charset=utf-8;');
        alert('Sevkiyat listesi CSV olarak indirildi.');
    });

    exportExcelBtn.addEventListener('click', () => {
        const sevkiyatlar = JSON.parse(localStorage.getItem('sevkiyatlar')) || {};
        const csvData = convertToCSV(sevkiyatlar);
        downloadFile(csvData, 'sevkiyat_listesi.xls', 'application/vnd.ms-excel;charset=utf-8;');
        alert('Sevkiyat listesi Excel (XLS) olarak indirildi.');
    });

    // Sayfa yüklendiğinde listeyi göster
    window.addEventListener('load', () => renderSevkiyatListesi());
}


// =========================================================
// ANASAYFA (index.html) KODU
// =========================================================

const aramaFormu = document.getElementById('arama-formu');
const detaylarDiv = document.getElementById('sevkiyat-detaylari');

if (aramaFormu) {
    aramaFormu.addEventListener('submit', (e) => {
        e.preventDefault();
        const kod = document.getElementById('aramaKodu').value.toUpperCase().trim();
        const sevkiyatlar = JSON.parse(localStorage.getItem('sevkiyatlar')) || {};
        
        if (sevkiyatlar[kod]) {
            renderSevkiyatDetaylari(kod, sevkiyatlar[kod]);
        } else {
            detaylarDiv.innerHTML = '<p class="not-found">Bu Sevkiyat Kodu bulunamadı.</p>';
        }
    });
}

// Sevkiyat detaylarını ekrana basan fonksiyon (Anasayfa için) (Aynı kaldı)
function renderSevkiyatDetaylari(kod, sevkiyat) {
    let gorselHTML;
    if (!sevkiyat.gorseller || sevkiyat.gorseller.length === 0) {
        gorselHTML = '<p style="color:var(--color-text-medium);">Bu sevkiyata ait görsel bulunmamaktadır.</p>';
    } else {
        gorselHTML = sevkiyat.gorseller.map(base64 => 
            `<img src="${base64}" alt="Sevkiyat Görseli">`
        ).join('');
    }

    detaylarDiv.innerHTML = `
        <h2>Sevkiyat Detayları: ${kod}</h2>
        <p><strong>Plaka:</strong> ${sevkiyat.plaka}</p>
        <p><strong>Teslim Eden:</strong> ${sevkiyat.teslimEden}</p>
        <p><strong>Teslim Alan:</strong> ${sevkiyat.teslimAlan}</p>
        <p><strong>Tarih:</strong> ${sevkiyat.tarih}</p>
        <p><strong>Telefon:</strong> ${sevkiyat.telefon || 'Belirtilmemiş'}</p>
        <hr>
        <h3>Teslimat Görselleri (${sevkiyat.gorseller ? sevkiyat.gorseller.length : 0} Adet)</h3>
        <div class="gorsel-galeri">
            ${gorselHTML}
        </div>
    `;
}
// =========================================================
// KULLANICI YÖNETİMİ SAYFASI (users.html)
// =========================================================

const userTableBody = document.getElementById('user-tablosu-body');

if (userTableBody) {
    const currentUserEmail = localStorage.getItem('currentUser');
    
    // Güvenlik Kontrolü: Sadece admin@mkenr.com erişebilir
    if (currentUserEmail !== 'admin@mkenr.com') {
        alert("Bu sayfaya erişim yetkiniz yoktur.");
        window.location.href = 'admin.html';
    }

    function renderUserList() {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        userTableBody.innerHTML = '';

        Object.values(users).forEach(user => {
            const row = userTableBody.insertRow();
            
            row.insertCell().textContent = user.email;
            row.insertCell().textContent = `${user.ad} ${user.soyad}`;
            row.insertCell().textContent = user.telefon;

            const actionCell = row.insertCell();
            actionCell.classList.add('action-buttons');
            
            // Eğer varsayılan admin DEĞİLSE, Sil butonu göster
            if (user.email !== 'admin@mkenr.com') {
                 const deleteBtn = document.createElement('button');
                 deleteBtn.textContent = 'Sil';
                 deleteBtn.classList.add('secondary-button', 'delete-button');
                 deleteBtn.onclick = () => deleteUser(user.email);
                 actionCell.appendChild(deleteBtn);
            } else {
                actionCell.textContent = 'Ana Admin';
                actionCell.style.color = 'var(--color-primary)';
                actionCell.style.fontWeight = 'bold';
            }
        });
    }

    function deleteUser(email) {
        if (confirm(`${email} kullanıcısını silmek istediğinizden emin misiniz?`)) {
            let users = JSON.parse(localStorage.getItem('users'));
            delete users[email];
            localStorage.setItem('users', JSON.stringify(users));
            alert(`${email} kullanıcısı başarıyla silindi.`);
            renderUserList(); 
        }
    }

    window.addEventListener('load', renderUserList);
}