// ===================================
// 全体の共通ロジック
// ===================================

let points = parseInt(localStorage.getItem('points')) || 0;
let dailyStampData = JSON.parse(localStorage.getItem('dailyStamps')) || {};
let collectedAnimals = JSON.parse(localStorage.getItem('collectedAnimals')) || [];
const gachaCost = 30;

document.addEventListener('DOMContentLoaded', () => {
    // ページ遷移のセットアップ
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page');
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
            updateUI();
        });
    });

    // 初期UIの更新
    updateUI();
});

function updateUI() {
    // スタンプページのUI更新
    const today = new Date().toISOString().slice(0, 10);
    const stampsToday = dailyStampData[today] || 0;
    document.getElementById('stamp-count').textContent = stampsToday;
    document.getElementById('points-count-stamp').textContent = points;
    
    // ガチャページのUI更新
    document.getElementById('points-count-gacha').textContent = points;
    const uncollected = getUncollectedAnimals();
    document.getElementById('gacha-button').disabled = uncollected.length === 0;
    if (uncollected.length === 0) {
        document.getElementById('result-text').textContent = "あたらしいどうぶつさんをまとう！";
    }

    // 図鑑ページのUI更新
    updateZooStats();
    filterAnimals();
    
    // カレンダーページのUI更新
    renderCalendar();
}

// ===================================
// スタンプ機能
// ===================================

const stampButton = document.getElementById('stamp-button');
if (stampButton) {
    stampButton.addEventListener('click', stampToday);
}

function stampToday() {
    const today = new Date().toISOString().slice(0, 10);
    dailyStampData[today] = (dailyStampData[today] || 0) + 1;
    localStorage.setItem('dailyStamps', JSON.stringify(dailyStampData));

    points += 10;
    localStorage.setItem('points', points);
    
    updateUI();
}

// ===================================
// ガチャ機能
// ===================================

const gachaButton = document.getElementById('gacha-button');
if (gachaButton) {
    gachaButton.addEventListener('click', drawGacha);
}

function getAllAnimals() {
    return Object.values(ANIMAL_MASTER_DATA).flat();
}

function getUncollectedAnimals() {
    const allAnimals = getAllAnimals();
    return allAnimals.filter(animal => !collectedAnimals.includes(animal.name));
}

function drawGacha() {
    if (points < gachaCost) {
        document.getElementById('result-text').textContent = "ポイントがたりないよ...！";
        document.getElementById('result-image').style.display = 'none';
        return;
    }

    const uncollected = getUncollectedAnimals();
    if (uncollected.length === 0) {
        document.getElementById('result-text').textContent = "あたらしいどうぶつさんをまとう！";
        document.getElementById('gacha-button').disabled = true;
        document.getElementById('result-image').style.display = 'none';
        return;
    }

    const newAnimal = uncollected[Math.floor(Math.random() * uncollected.length)];
    
    points -= gachaCost;
    localStorage.setItem('points', points);

    collectedAnimals.push(newAnimal.name);
    localStorage.setItem('collectedAnimals', JSON.stringify(collectedAnimals));

    document.getElementById('result-text').textContent = `${newAnimal.name} をゲットしたよ！`;
    document.getElementById('result-image').src = newAnimal.image;
    document.getElementById('result-image').style.display = 'block';

    updateUI();
}

// ===================================
// 図鑑機能
// ===================================

const animalTypeSelect = document.getElementById('animal-type');
if (animalTypeSelect) {
    animalTypeSelect.addEventListener('change', filterAnimals);
}

function updateZooStats() {
    const totalAnimals = getAllAnimals().length;
    const collectedCount = collectedAnimals.length;
    const collectionRate = (collectedCount / totalAnimals * 100).toFixed(1);

    document.getElementById('collected-count').textContent = collectedCount;
    document.getElementById('total-count').textContent = totalAnimals;
    document.getElementById('collection-rate').textContent = `${collectionRate}%`;
}

function renderZoo(filteredAnimals) {
    const zooContainer = document.getElementById('zoo');
    if (!zooContainer) return;
    zooContainer.innerHTML = '';

    if (filteredAnimals.length === 0) {
        zooContainer.innerHTML = '<p style="text-align: center; color: #777;">この種別の動物はまだ集めていないみたい。</p>';
        return;
    }

    filteredAnimals.forEach(animal => {
        const isCollected = collectedAnimals.includes(animal.name);
        const card = document.createElement('div');
        card.classList.add('animal-card');
        if (!isCollected) {
            card.style.opacity = '0.5';
        }

        const image = document.createElement('img');
        image.src = isCollected ? animal.image : 'https://placehold.jp/150x100.png?text=???';
        image.alt = animal.name;

        const name = document.createElement('h3');
        name.textContent = isCollected ? animal.name : 'なまえ：？？？';

        const description = document.createElement('p');
        description.textContent = isCollected ? animal.description : 'せつめい：？？？';

        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(description);
        zooContainer.appendChild(card);
    });
}

function filterAnimals() {
    const selectedType = document.getElementById('animal-type').value;
    let filteredAnimals = [];
    if (selectedType === 'all') {
        filteredAnimals = getAllAnimals();
    } else {
        filteredAnimals = ANIMAL_MASTER_DATA[selectedType] || [];
    }
    renderZoo(filteredAnimals);
}

// ===================================
// カレンダー機能
// ===================================

let currentDate = new Date();
const monthYearEl = document.getElementById('month-year');
const calendarDaysEl = document.getElementById('calendar-days');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const modal = document.getElementById('stamp-detail-modal');
const modalDateEl = document.getElementById('modal-date');
const modalCountEl = document.getElementById('modal-count');
const modalCloseBtn = document.querySelector('.modal-close');

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
}
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}
if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', hideModal);
}
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        hideModal();
    }
});

function renderCalendar() {
    if (!calendarDaysEl) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearEl.textContent = `${year}年 ${month + 1}月`;
    calendarDaysEl.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
        const dayEl = document.createElement('div');
        calendarDaysEl.appendChild(dayEl);
    }

    for (let day = 1; day <= lastDay; day++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day', 'current-month');
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        dayEl.innerHTML = `<div>${day}</div>`;
        
        if (dailyStampData[dateString]) {
            const stampCount = dailyStampData[dateString];
            const countEl = document.createElement('div');
            countEl.classList.add('stamp-count');
            countEl.textContent = `${stampCount}回`;
            dayEl.appendChild(countEl);
        }

        dayEl.addEventListener('click', () => showStampDetail(dateString));
        calendarDaysEl.appendChild(dayEl);
    }
}

function showStampDetail(dateString) {
    const date = new Date(dateString);
    const dateText = `${date.getFullYear()}年 ${date.getMonth() + 1}月 ${date.getDate()}日`;
    const count = dailyStampData[dateString] || 0;

    modalDateEl.textContent = dateText;
    modalCountEl.textContent = count;
    modal.style.display = 'flex';
}

function hideModal() {
    modal.style.display = 'none';
}
