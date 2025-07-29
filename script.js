// Global Variables
let currentStep = 1;
let currentAppointmentStep = 1;
let selectedBodyPart = '';
let selectedTime = '';
let selectedDuration = '';
let selectedPainLevel = 5;
let selectedTreatment = '';
let selectedDepartment = '';
let selectedDoctor = '';
let selectedAppointmentDate = '';
let selectedAppointmentTime = '';
let selectedGender = '';
let currentBMI = 0;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeModules();
    setupEventListeners();
    setMinDate();
});

// Initialize all modules
function initializeModules() {
    // Initialize symptom checker
    initializeSymptomChecker();
    
    // Initialize BMI calculator
    initializeBMICalculator();
    
    // Initialize appointment system
    initializeAppointmentSystem();
    
    // Initialize patient portal
    initializePatientPortal();
    
    // Initialize blog
    initializeBlog();
    
    // Initialize event calendar
    initializeEventCalendar();
    
    // Show notification
    showNotification('Tüm modüller başarıyla yüklendi!', 'success');
}

// Setup event listeners
function setupEventListeners() {
    // Smooth scrolling for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Pain slider
    const painSlider = document.getElementById('pain-slider');
    if (painSlider) {
        painSlider.addEventListener('input', function() {
            selectedPainLevel = this.value;
            document.getElementById('pain-value').textContent = this.value;
        });
    }
    
    // Chat input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Blog search
    const blogSearch = document.getElementById('blog-search');
    if (blogSearch) {
        blogSearch.addEventListener('input', function() {
            filterBlogPosts(this.value);
        });
    }
}

// BMI Hesaplayıcı Modülü
function initializeBMICalculator() {
    // Gender selection
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedGender = this.dataset.gender;
        });
    });
}

function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    
    // Validation
    if (!height || !weight || !age || !selectedGender) {
        showNotification('Lütfen tüm alanları doldurun ve cinsiyet seçin.', 'warning');
        return;
    }
    
    if (height < 100 || height > 250) {
        showNotification('Lütfen geçerli bir boy değeri girin (100-250 cm).', 'warning');
        return;
    }
    
    if (weight < 30 || weight > 300) {
        showNotification('Lütfen geçerli bir kilo değeri girin (30-300 kg).', 'warning');
        return;
    }
    
    // Calculate BMI
    const heightInMeters = height / 100;
    currentBMI = weight / (heightInMeters * heightInMeters);
    
    // Display results
    displayBMIResults(currentBMI, height, weight, age, selectedGender);
    
    // Show results section
    document.getElementById('bmi-results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('bmi-results').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    showNotification('BMI hesaplaması tamamlandı!', 'success');
}

function displayBMIResults(bmi, height, weight, age, gender) {
    // Update BMI value
    document.getElementById('bmi-value').textContent = bmi.toFixed(1);
    
    // Determine category and color
    let category, categoryColor;
    if (bmi < 18.5) {
        category = 'Zayıf';
        categoryColor = '#3498db';
    } else if (bmi < 25) {
        category = 'Normal';
        categoryColor = '#28a745';
    } else if (bmi < 30) {
        category = 'Fazla Kilolu';
        categoryColor = '#ffc107';
    } else {
        category = 'Obez';
        categoryColor = '#dc3545';
    }
    
    // Update category
    const categoryElement = document.getElementById('bmi-category');
    categoryElement.textContent = category;
    categoryElement.style.color = categoryColor;
    
    // Update gauge pointer
    updateGaugePointer(bmi);
    
    // Calculate ideal weight range
    const idealWeightMin = (18.5 * Math.pow(height / 100, 2)).toFixed(1);
    const idealWeightMax = (24.9 * Math.pow(height / 100, 2)).toFixed(1);
    document.getElementById('ideal-weight').textContent = `${idealWeightMin} - ${idealWeightMax} kg`;
    
    // Calculate weight change needed
    let weightChange = '';
    if (bmi < 18.5) {
        const minWeight = parseFloat(idealWeightMin);
        const changeNeeded = (minWeight - weight).toFixed(1);
        weightChange = `${changeNeeded} kg almalısınız`;
    } else if (bmi > 25) {
        const maxWeight = parseFloat(idealWeightMax);
        const changeNeeded = (weight - maxWeight).toFixed(1);
        weightChange = `${changeNeeded} kg vermelisiniz`;
    } else {
        weightChange = 'İdeal kilonuzdasınız';
    }
    document.getElementById('weight-change').textContent = weightChange;
    
    // Health status
    let healthStatus = '';
    if (bmi < 18.5) {
        healthStatus = 'Yetersiz beslenme riski';
    } else if (bmi < 25) {
        healthStatus = 'Sağlıklı kilo aralığında';
    } else if (bmi < 30) {
        healthStatus = 'Sağlık riskleri artabilir';
    } else {
        healthStatus = 'Ciddi sağlık riskleri';
    }
    document.getElementById('health-status').textContent = healthStatus;
    
    // Generate recommendations
    generateBMIRecommendations(bmi, age, gender);
}

function updateGaugePointer(bmi) {
    const pointer = document.getElementById('gauge-pointer');
    let position;
    
    if (bmi < 18.5) {
        position = (bmi / 18.5) * 25; // 0-25% for underweight
    } else if (bmi < 25) {
        position = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25; // 25-50% for normal
    } else if (bmi < 30) {
        position = 50 + ((bmi - 25) / (30 - 25)) * 25; // 50-75% for overweight
    } else {
        position = 75 + Math.min(((bmi - 30) / 10) * 25, 25); // 75-100% for obese
    }
    
    pointer.style.left = `${Math.min(position, 100)}%`;
}

function generateBMIRecommendations(bmi, age, gender) {
    const recommendationList = document.getElementById('recommendation-list');
    recommendationList.innerHTML = '';
    
    let recommendations = [];
    
    if (bmi < 18.5) {
        recommendations = [
            { icon: 'fas fa-utensils', text: 'Kalori alımınızı artırın, sağlıklı yağlar ve proteinler tüketin' },
            { icon: 'fas fa-dumbbell', text: 'Kas kütlesi artırmak için direnç egzersizleri yapın' },
            { icon: 'fas fa-user-md', text: 'Beslenme uzmanından profesyonel destek alın' },
            { icon: 'fas fa-clock', text: 'Düzenli öğün saatleri oluşturun, ara öğünleri ihmal etmeyin' }
        ];
    } else if (bmi < 25) {
        recommendations = [
            { icon: 'fas fa-check-circle', text: 'Mevcut kiloyu korumak için dengeli beslenmeye devam edin' },
            { icon: 'fas fa-running', text: 'Haftada en az 150 dakika orta şiddette egzersiz yapın' },
            { icon: 'fas fa-apple-alt', text: 'Bol meyve ve sebze tüketin, işlenmiş gıdalardan kaçının' },
            { icon: 'fas fa-tint', text: 'Günde en az 8 bardak su için' }
        ];
    } else if (bmi < 30) {
        recommendations = [
            { icon: 'fas fa-chart-line', text: 'Haftada 0.5-1 kg kilo vermek için kalori açığı oluşturun' },
            { icon: 'fas fa-walking', text: 'Günlük yürüyüş sürenizi artırın, merdiven kullanın' },
            { icon: 'fas fa-ban', text: 'Şekerli içecekler ve atıştırmalıklardan kaçının' },
            { icon: 'fas fa-calendar-check', text: 'Düzenli kilo takibi yapın ve hedefler belirleyin' }
        ];
    } else {
        recommendations = [
            { icon: 'fas fa-user-md', text: 'Mutlaka bir doktor ve diyetisyenle görüşün' },
            { icon: 'fas fa-heart', text: 'Kalp sağlığınızı kontrol ettirin, kan tahlilleri yaptırın' },
            { icon: 'fas fa-weight', text: 'Kademeli kilo verme programı başlatın' },
            { icon: 'fas fa-users', text: 'Aile desteği alın, grup aktivitelerine katılın' }
        ];
    }
    
    // Age and gender specific recommendations
    if (age > 50) {
        recommendations.push({
            icon: 'fas fa-bone',
            text: 'Kemik sağlığı için kalsiyum ve D vitamini alımına dikkat edin'
        });
    }
    
    if (gender === 'female' && age >= 18 && age <= 45) {
        recommendations.push({
            icon: 'fas fa-leaf',
            text: 'Demir eksikliği için yeşil yapraklı sebzeler ve kırmızı et tüketin'
        });
    }
    
    // Display recommendations
    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <i class="${rec.icon}"></i>
            <span>${rec.text}</span>
        `;
        recommendationList.appendChild(item);
    });
}

function bookNutritionistAppointment() {
    showNotification('Diyetisyen randevusu için yönlendiriliyorsunuz...', 'info');
    // Scroll to appointment section
    document.getElementById('appointment-system').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function downloadBMIReport() {
    if (currentBMI === 0) {
        showNotification('Önce BMI hesaplaması yapın.', 'warning');
        return;
    }
    
    showNotification('BMI raporu PDF olarak indiriliyor...', 'success');
    
    // Create a simple report content
    const reportContent = `
BMI RAPORU
==========

BMI Değeri: ${currentBMI.toFixed(1)}
Kategori: ${document.getElementById('bmi-category').textContent}
İdeal Kilo Aralığı: ${document.getElementById('ideal-weight').textContent}
Önerilen Değişim: ${document.getElementById('weight-change').textContent}
Sağlık Durumu: ${document.getElementById('health-status').textContent}

Bu rapor ${new Date().toLocaleDateString('tr-TR')} tarihinde oluşturulmuştur.
Hisar Hospital - Sağlık Modülleri
    `;
    
    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bmi_raporu.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function shareBMIResult() {
    if (currentBMI === 0) {
        showNotification('Önce BMI hesaplaması yapın.', 'warning');
        return;
    }
    
    const shareText = `BMI değerim: ${currentBMI.toFixed(1)} - ${document.getElementById('bmi-category').textContent}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'BMI Sonucum',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('BMI sonucu panoya kopyalandı!', 'success');
        });
    }
}

// Semptom Yönlendirme Modülü
function initializeSymptomChecker() {
    // Body part selection
    document.querySelectorAll('.body-part').forEach(part => {
        part.addEventListener('click', function() {
            document.querySelectorAll('.body-part').forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
            selectedBodyPart = this.dataset.part;
        });
    });
    
    // Time selection
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedTime = this.dataset.time;
        });
    });
    
    // Navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentStep > 1) {
                currentStep--;
                updateSymptomStep();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (validateCurrentStep()) {
                if (currentStep < 4) {
                    currentStep++;
                    updateSymptomStep();
                }
            }
        });
    }
}

function updateSymptomStep() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update questions
    document.querySelectorAll('.question').forEach((question, index) => {
        if (index + 1 === currentStep) {
            question.classList.add('active');
        } else {
            question.classList.remove('active');
        }
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) {
        prevBtn.disabled = currentStep === 1;
    }
    
    if (nextBtn) {
        if (currentStep === 4) {
            nextBtn.textContent = 'Tamamla';
        } else {
            nextBtn.textContent = 'Sonraki';
        }
    }
    
    // Generate recommendation for step 4
    if (currentStep === 4) {
        generateRecommendation();
    }
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            if (!selectedBodyPart) {
                showNotification('Lütfen rahatsızlık yaşadığınız bölgeyi seçin.', 'warning');
                return false;
            }
            break;
        case 2:
            if (!selectedTime) {
                showNotification('Lütfen şikayetinizin süresini seçin.', 'warning');
                return false;
            }
            break;
        case 3:
            // Pain level is always valid (has default value)
            break;
    }
    return true;
}

function generateRecommendation() {
    const recommendations = {
        'head': {
            doctor: 'Dr. Ayşe Kaya',
            specialty: 'Nöroloji Uzmanı',
            condition: 'Baş Ağrısı'
        },
        'chest': {
            doctor: 'Dr. Mehmet Özkan',
            specialty: 'Kardiyoloji Uzmanı',
            condition: 'Göğüs Ağrısı'
        },
        'abdomen': {
            doctor: 'Dr. Fatma Demir',
            specialty: 'Gastroenteroloji Uzmanı',
            condition: 'Karın Ağrısı'
        },
        'limbs': {
            doctor: 'Dr. Ali Yılmaz',
            specialty: 'Ortopedi Uzmanı',
            condition: 'Kas-İskelet Ağrısı'
        }
    };
    
    const recommendation = recommendations[selectedBodyPart] || recommendations['head'];
    
    // Update doctor card
    const doctorCard = document.querySelector('.doctor-info');
    if (doctorCard) {
        doctorCard.querySelector('h4').textContent = recommendation.doctor;
        doctorCard.querySelector('p').textContent = recommendation.specialty;
    }
}

// Zaman Tüneli Modülü
function addTimelineEvent() {
    showNotification('Yeni olay ekleme formu açılacak.', 'info');
    // Modal açma işlevi burada implement edilebilir
}

function exportTimeline() {
    showNotification('Sağlık geçmişiniz PDF olarak indiriliyor...', 'success');
    // PDF export işlevi burada implement edilebilir
}

// Tedavi Simülatörü Modülü
document.querySelectorAll('.treatment-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.treatment-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedTreatment = this.dataset.treatment;
        showTreatmentDetails();
    });
});

function showTreatmentDetails() {
    const detailsSection = document.getElementById('treatment-details');
    if (detailsSection) {
        detailsSection.style.display = 'block';
        detailsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Insurance selection
const insuranceSelect = document.getElementById('insurance-select');
if (insuranceSelect) {
    insuranceSelect.addEventListener('change', function() {
        calculateInsuranceCoverage(this.value);
    });
}

function calculateInsuranceCoverage(insuranceType) {
    const coverageDiv = document.querySelector('.insurance-coverage');
    if (!coverageDiv) return;
    
    let coverage = '';
    let patientPayment = 0;
    const totalCost = 52500;
    
    switch (insuranceType) {
        case 'sgk':
            patientPayment = totalCost * 0.2; // %20 hasta payı
            coverage = `SGK kapsamında %80 karşılanır. Tahmini hasta payı: ₺${patientPayment.toLocaleString()}`;
            break;
        case 'private':
            patientPayment = totalCost * 0.1; // %10 hasta payı
            coverage = `Özel sigorta kapsamında %90 karşılanır. Tahmini hasta payı: ₺${patientPayment.toLocaleString()}`;
            break;
        default:
            coverage = '';
    }
    
    if (coverage) {
        coverageDiv.innerHTML = `<p style="color: var(--primary-blue); font-weight: 500;">${coverage}</p>`;
        coverageDiv.style.display = 'block';
    } else {
        coverageDiv.style.display = 'none';
    }
}

function requestQuote() {
    showNotification('Detaylı teklif talebiniz alındı. En kısa sürede size dönüş yapılacaktır.', 'success');
}

// VR Tur Modülü
function show360View(location) {
    if (location) {
        showNotification(`${location} bölümünün 360° görünümü açılıyor...`, 'info');
    } else {
        showNotification('360° görünüm açılıyor...', 'info');
    }
    // VR viewer implementation burada olacak
}

function startVRTour() {
    showNotification('VR tur başlatılıyor... VR gözlüğünüzü takın.', 'info');
    // VR tour implementation burada olacak
}

// Sağlık Koçu Modülü
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    
    // Clear input
    chatInput.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const botResponse = generateBotResponse(message);
        addChatMessage(botResponse, 'bot');
    }, 1000);
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p>${message}</p>`;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateBotResponse(userMessage) {
    const responses = {
        'baş ağrısı': 'Baş ağrısı için öncelikle dinlenmenizi ve bol su içmenizi öneririm. Eğer ağrı devam ederse Nöroloji uzmanımızla randevu alabilirsiniz.',
        'randevu': 'Randevu almak için Online Randevu modülümüzü kullanabilir veya 0212 XXX XX XX numaralı telefonumuzu arayabilirsiniz.',
        'doktor': 'Hangi konuda uzman arıyorsunuz? Size en uygun doktorumuzu önerebilirim.',
        'bmi': 'BMI hesaplamak için BMI Hesaplayıcı modülümüzü kullanabilirsiniz. Boy, kilo, yaş ve cinsiyet bilgilerinizi girerek detaylı analiz alabilirsiniz.',
        'kilo': 'Kilo kontrolü için BMI hesaplayıcımızı kullanabilir, beslenme önerilerimizi inceleyebilir ve diyetisyen randevusu alabilirsiniz.',
        'default': 'Sorunuzla ilgili size yardımcı olmaya çalışacağım. Daha detaylı bilgi için uzmanlarımızla iletişime geçebilirsiniz.'
    };
    
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return responses.default;
}

function askQuickQuestion(question) {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = question;
        sendMessage();
    }
}

// İlaç Hatırlatma Modülü
function setReminder(button) {
    button.classList.toggle('active');
    const medicationName = button.parentElement.querySelector('h4').textContent;
    
    if (button.classList.contains('active')) {
        showNotification(`${medicationName} için hatırlatma aktif edildi.`, 'success');
        button.style.background = 'var(--success)';
    } else {
        showNotification(`${medicationName} için hatırlatma deaktif edildi.`, 'info');
        button.style.background = 'var(--primary-orange)';
    }
}

function addMedication() {
    showNotification('Yeni ilaç ekleme formu açılacak.', 'info');
    // Modal açma işlevi burada implement edilebilir
}

// Uzman Görüşü Modülü
function uploadMedicalFile() {
    showNotification('Dosya yükleme penceresi açılacak.', 'info');
    // File upload implementation burada olacak
}

function submitSecondOpinion() {
    const form = document.getElementById('opinion-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'var(--danger)';
        } else {
            field.style.borderColor = 'var(--light-gray)';
        }
    });
    
    if (isValid) {
        showNotification('İkinci görüş talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapılacaktır.', 'success');
        form.reset();
    } else {
        showNotification('Lütfen tüm zorunlu alanları doldurun.', 'warning');
    }
}

// Online Randevu Modülü
function initializeAppointmentSystem() {
    // Department selection
    document.querySelectorAll('.department-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.department-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedDepartment = this.dataset.dept;
            document.getElementById('selected-department').textContent = this.querySelector('h4').textContent;
            document.getElementById('selected-info').style.display = 'block';
        });
    });
    
    // Date input
    const dateInput = document.getElementById('appointment-date');
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            selectedAppointmentDate = this.value;
            generateTimeSlots();
        });
    }
}

function nextStep() {
    if (validateAppointmentStep()) {
        if (currentAppointmentStep < 4) {
            currentAppointmentStep++;
            updateAppointmentStep();
            
            // Load doctors for step 2
            if (currentAppointmentStep === 2) {
                loadDoctors();
            }
        } else {
            // Complete appointment
            completeAppointment();
        }
    }
}

function previousStep() {
    if (currentAppointmentStep > 1) {
        currentAppointmentStep--;
        updateAppointmentStep();
    }
}

function updateAppointmentStep() {
    // Update step indicators
    document.querySelectorAll('.step-item').forEach((step, index) => {
        if (index + 1 <= currentAppointmentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update panels
    document.querySelectorAll('.step-panel').forEach((panel, index) => {
        if (index + 1 === currentAppointmentStep) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');
    
    if (prevBtn) {
        prevBtn.disabled = currentAppointmentStep === 1;
    }
    
    if (nextBtn) {
        if (currentAppointmentStep === 4) {
            nextBtn.textContent = 'Randevuyu Onayla';
        } else {
            nextBtn.textContent = 'Sonraki';
        }
    }
    
    // Update summary for step 4
    if (currentAppointmentStep === 4) {
        updateAppointmentSummary();
    }
}

function validateAppointmentStep() {
    switch (currentAppointmentStep) {
        case 1:
            if (!selectedDepartment) {
                showNotification('Lütfen bir branş seçin.', 'warning');
                return false;
            }
            break;
        case 2:
            if (!selectedDoctor) {
                showNotification('Lütfen bir doktor seçin.', 'warning');
                return false;
            }
            break;
        case 3:
            if (!selectedAppointmentDate || !selectedAppointmentTime) {
                showNotification('Lütfen tarih ve saat seçin.', 'warning');
                return false;
            }
            break;
    }
    return true;
}

function loadDoctors() {
    const doctorList = document.getElementById('doctor-list');
    if (!doctorList) return;
    
    const doctors = {
        'cardiology': [
            { name: 'Dr. Mehmet Özkan', experience: '15 yıl', rating: '4.9' },
            { name: 'Dr. Zeynep Kaya', experience: '12 yıl', rating: '4.8' }
        ],
        'neurology': [
            { name: 'Dr. Ayşe Kaya', experience: '18 yıl', rating: '4.9' },
            { name: 'Dr. Can Demir', experience: '10 yıl', rating: '4.7' }
        ],
        'orthopedics': [
            { name: 'Dr. Ali Yılmaz', experience: '20 yıl', rating: '4.8' },
            { name: 'Dr. Selin Özkan', experience: '8 yıl', rating: '4.6' }
        ],
        'dermatology': [
            { name: 'Dr. Fatma Demir', experience: '14 yıl', rating: '4.9' },
            { name: 'Dr. Murat Kaya', experience: '11 yıl', rating: '4.7' }
        ]
    };
    
    const departmentDoctors = doctors[selectedDepartment] || [];
    
    doctorList.innerHTML = '';
    
    departmentDoctors.forEach(doctor => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'doctor-card';
        doctorCard.innerHTML = `
            <img src="https://via.placeholder.com/80x80" alt="Doktor">
            <div class="doctor-info">
                <h4>${doctor.name}</h4>
                <p>${doctor.experience} deneyim</p>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <span>${doctor.rating}</span>
                </div>
            </div>
        `;
        
        doctorCard.addEventListener('click', function() {
            document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedDoctor = doctor.name;
            document.getElementById('selected-doctor').textContent = doctor.name;
        });
        
        doctorList.appendChild(doctorCard);
    });
}

function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('time-slots');
    if (!timeSlotsContainer) return;
    
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
    
    timeSlotsContainer.innerHTML = '';
    
    timeSlots.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = time;
        
        timeSlot.addEventListener('click', function() {
            document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            selectedAppointmentTime = time;
        });
        
        timeSlotsContainer.appendChild(timeSlot);
    });
}

function updateAppointmentSummary() {
    const departmentNames = {
        'cardiology': 'Kardiyoloji',
        'neurology': 'Nöroloji',
        'orthopedics': 'Ortopedi',
        'dermatology': 'Dermatoloji'
    };
    
    document.getElementById('summary-department').textContent = departmentNames[selectedDepartment] || '';
    document.getElementById('summary-doctor').textContent = selectedDoctor;
    document.getElementById('summary-date').textContent = selectedAppointmentDate;
    document.getElementById('summary-time').textContent = selectedAppointmentTime;
}

function completeAppointment() {
    showNotification('Randevunuz başarıyla oluşturuldu! SMS ile onay gönderilecektir.', 'success');
    
    // Reset form
    currentAppointmentStep = 1;
    selectedDepartment = '';
    selectedDoctor = '';
    selectedAppointmentDate = '';
    selectedAppointmentTime = '';
    
    updateAppointmentStep();
}

// Hasta Portalı Modülü
function initializePatientPortal() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        if (panel.dataset.panel === tabName) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

// Sağlık Blogu Modülü
function initializeBlog() {
    // Category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            filterBlogByCategory(category);
        });
    });
}

function filterBlogByCategory(category) {
    document.querySelectorAll('.blog-post').forEach(post => {
        if (category === 'all' || post.dataset.category === category) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

function filterBlogPosts(searchTerm) {
    document.querySelectorAll('.blog-post').forEach(post => {
        const title = post.querySelector('h3').textContent.toLowerCase();
        const content = post.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm.toLowerCase()) || content.includes(searchTerm.toLowerCase())) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

// Etkinlik Takvimi Modülü
function initializeEventCalendar() {
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            switchCalendarView(view);
        });
    });
    
    // Month navigation
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            showNotification('Önceki ay gösteriliyor...', 'info');
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            showNotification('Sonraki ay gösteriliyor...', 'info');
        });
    }
    
    // Event category filter
    const categorySelect = document.getElementById('event-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            filterEventsByCategory(this.value);
        });
    }
}

function switchCalendarView(view) {
    document.querySelectorAll('[data-view]').forEach(element => {
        if (element.dataset.view === view) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });
}

function filterEventsByCategory(category) {
    document.querySelectorAll('.event-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Utility Functions
function setMinDate() {
    const dateInput = document.getElementById('appointment-date');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Set color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'var(--success)';
            break;
        case 'warning':
            notification.style.background = 'var(--warning)';
            notification.style.color = 'var(--dark-gray)';
            break;
        case 'error':
            notification.style.background = 'var(--danger)';
            break;
        default:
            notification.style.background = 'var(--info)';
    }
    
    container.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Event Registration Functions
function registerForEvent(eventName) {
    showNotification(`${eventName} etkinliği için kayıt işlemi başlatılıyor...`, 'info');
    // Event registration implementation burada olacak
}

// Generic button click handlers
document.addEventListener('click', function(e) {
    // Event registration buttons
    if (e.target.textContent === 'Kayıt Ol' || e.target.textContent === 'Kayıt') {
        const eventCard = e.target.closest('.event-card, .upcoming-item');
        if (eventCard) {
            const eventTitle = eventCard.querySelector('h3, .title')?.textContent || 'Etkinlik';
            registerForEvent(eventTitle);
        }
    }
    
    // Detail buttons
    if (e.target.textContent === 'Detaylar') {
        showNotification('Etkinlik detayları açılıyor...', 'info');
    }
    
    // PDF download buttons
    if (e.target.textContent === 'PDF İndir') {
        showNotification('PDF dosyası indiriliyor...', 'success');
    }
    
    // Share buttons
    if (e.target.classList.contains('share-btn') || e.target.parentElement?.classList.contains('share-btn')) {
        showNotification('Paylaşım seçenekleri açılıyor...', 'info');
    }
    
    // Newsletter subscription
    if (e.target.textContent === 'Abone Ol') {
        const emailInput = e.target.parentElement?.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
            showNotification('E-posta bültenine başarıyla abone oldunuz!', 'success');
            emailInput.value = '';
        } else {
            showNotification('Lütfen geçerli bir e-posta adresi girin.', 'warning');
        }
    }
});

