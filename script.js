// ===== 1. ЭФФЕКТ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll(".fade").forEach(el => {
    observer.observe(el);
});

// ===== 2. ТАЙМЕР =====
const weddingDate = new Date("July 26, 2026 14:30:00").getTime();

function countdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance <= 0) {
        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

countdown();
setInterval(countdown, 1000);

// ===== 3. ЭФФЕКТ НАВЕДЕНИЯ НА ФОТО =====
const photos = document.querySelectorAll(".photo img");

document.addEventListener("mousemove", e => {
    let x = (e.clientX / window.innerWidth - 0.5) * 8;
    let y = (e.clientY / window.innerHeight - 0.5) * 8;
    photos.forEach(photo => {
        photo.style.transform = `translate(${x}px,${y}px) scale(1.02)`;
    });
});

document.addEventListener("mouseleave", () => {
    photos.forEach(photo => {
        photo.style.transform = "";
    });
});

// ===== 4. СЧЁТЧИК ГОСТЕЙ =====
let guestCount = 2;

function changeGuests(delta) {
    guestCount = Math.max(1, Math.min(10, guestCount + delta));
    const countElement = document.getElementById('guestCount');
    if (countElement) {
        countElement.textContent = guestCount;
    }
}

// ===== 5. МОДАЛЬНОЕ ОКНО =====
const modal = document.getElementById('rsvpModal');
const openBtn = document.getElementById('openModalBtn');
const closeBtn = document.querySelector('.modal-close');

if (openBtn && modal) {
    openBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
}

if (closeBtn && modal) {
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForm();
    });
}

if (modal) {
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetForm();
        }
    });
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.style.display === 'block') {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForm();
    }
});

// ===== 6. СБРОС ФОРМЫ =====
function resetForm() {
    const form = document.getElementById('rsvpForm');
    const successDiv = document.getElementById('formSuccess');
    const title = document.getElementById('modalTitle');
    
    if (form) {
        form.style.display = 'block';
        form.reset();
    }
    if (successDiv) {
        successDiv.style.display = 'none';
    }
    if (title) {
        title.style.display = 'block';
    }
    
    guestCount = 2;
    const countElement = document.getElementById('guestCount');
    if (countElement) {
        countElement.textContent = guestCount;
    }
}

// ===== 7. ОТПРАВКА ФОРМЫ НА СЕРВЕР =====
// ===== НАСТРОЙКИ =====
const API_BASE = 'https://wedding-invitation29.onrender.com/api';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('rsvpForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('guestName');
            if (!nameInput.value.trim()) {
                alert('Пожалуйста, укажите ваше имя и фамилию.');
                nameInput.focus();
                return;
            }
            
            const formData = {
                name: document.getElementById('guestName').value.trim(),
                email: document.getElementById('guestEmail').value.trim(),
                phone: document.getElementById('guestPhone').value.trim(),
                guests: guestCount,
                comment: document.getElementById('guestComment').value.trim()
            };
            
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch(`${API_BASE}/rsvp`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    const title = document.getElementById('modalTitle');
                    if (title) {
                        title.style.display = 'none';
                    }
                    
                    form.style.display = 'none';
                    
                    const successDiv = document.getElementById('formSuccess');
                    if (successDiv) {
                        successDiv.style.display = 'block';
                    }
                } else {
                    const errorMsg = result.errors 
                        ? result.errors.map(e => e.msg).join('\n')
                        : result.message || 'Произошла ошибка';
                    alert('Ошибка: ' + errorMsg);
                }
            } catch (error) {
                console.error('Ошибка отправки:', error);
                alert('Не удалось отправить форму. Проверьте подключение к серверу.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});