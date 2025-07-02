// script.js
document.addEventListener('DOMContentLoaded', () => {
    // 🎯 Дефиниции на темите и техните изображения
    const ALL_THEMES = {
        превозни_средства: ['bus.jpg', 'airplane.jpg', 'firetruck.jpg', 'train.jpg', 'truck.jpg'],
        animals: ['dog.jpg', 'cat.jpg', 'lion.jpg', 'elephant.jpg', 'monkey.jpg'],
        flowers: ['rose.jpg', 'tulip.jpg', 'lily.jpg', 'daisy.jpg', 'sunflower.jpg']
    };

    // 🎯 DOM елементи
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const countRadios = document.querySelectorAll('input[name="count"]');
    const startGameBtn = document.getElementById('startGameBtn');
    const optionsContainer = document.getElementById('optionsContainer');

    const gameTitleEl = document.getElementById('gameTitle');
    const messageDisplay = document.getElementById('gameMessage');
    const startBtn = document.getElementById('start');
    const reloadBtn = document.getElementById('reload');
    const allPicsEl = document.getElementById('allPics');
    const gamePicsEl = document.getElementById('gamePics');
    const containerEl = document.getElementById('container');

    // 🎯 Променливи за състоянието на играта
    let currentThemeImages = [];
    let numberOfPics = 0;
    let selectedGamePics = [];
    let hiddenImageElement = null; // Референция към скрития img елемент
    let hiddenIndex = null;
    let awaitingChoice = false;
    let placeholderElement = null; // Референция към празно квадратче

    // --- Функции ---

    function updateStartButtonState() {
        const themeSelected = Array.from(themeRadios).some(r => r.checked);
        const countSelected = Array.from(countRadios).some(r => r.checked);
        startGameBtn.disabled = !(themeSelected && countSelected);
    }

    function startGame() {
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
        numberOfPics = parseInt(document.querySelector('input[name="count"]:checked').value);

        currentThemeImages = ALL_THEMES[selectedTheme];

        gameTitleEl.textContent = `Познай ${selectedTheme.replace('_', ' ').toUpperCase()}!`;
        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.', 'info');

        optionsContainer.classList.add('hidden');
        startGameBtn.classList.add('hidden');

        document.getElementById('controls').classList.remove('hidden');
        containerEl.classList.remove('hidden');

        renderGamePics();
        renderAllPics();
        resetGameState();
    }

    function renderAllPics() {
        allPicsEl.innerHTML = '';
        currentThemeImages.forEach(name => {
            const img = document.createElement('img');
            img.src = 'images/' + name;
            img.dataset.name = name;
            img.alt = name.replace('.jpg', '');
            img.addEventListener('click', chooseHandler);
            allPicsEl.appendChild(img);
        });
    }

    function renderGamePics() {
        gamePicsEl.innerHTML = '';
        const shuffledImages = [...currentThemeImages].sort(() => 0.5 - Math.random());
        selectedGamePics = shuffledImages.slice(0, numberOfPics);

        selectedGamePics.forEach((name, idx) => {
            const img = document.createElement('img');
            img.src = 'images/' + name;
            img.dataset.idx = idx;
            img.alt = name.replace('.jpg', '');
            gamePicsEl.appendChild(img);
        });

        reloadBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.disabled = false;
    }

    // Функция за скриване на произволна картинка
    function hideRandomPicture() {
        if (awaitingChoice) return;

        hiddenIndex = Math.floor(Math.random() * numberOfPics);
        hiddenImageElement = gamePicsEl.querySelectorAll('img')[hiddenIndex];

        // 1. Създаване на празното квадратче (placeholder)
        placeholderElement = document.createElement('div');
        placeholderElement.classList.add('hidden-placeholder');
        // Задаваме му същите размери като img, за да запази мястото
        placeholderElement.style.width = hiddenImageElement.offsetWidth + 'px';
        placeholderElement.style.height = hiddenImageElement.offsetHeight + 'px';

        // 2. Вмъкване на placeholder-а на мястото на картинката
        gamePicsEl.replaceChild(placeholderElement, hiddenImageElement);

        // 3. Позициониране на скритата картинка абсолютно (извън потока) и добавяне на клас за скриване
        hiddenImageElement.classList.add('is-hidden'); // Прилага opacity: 0
        hiddenImageElement.style.position = 'absolute';
        hiddenImageElement.style.left = placeholderElement.offsetLeft + 'px';
        hiddenImageElement.style.top = placeholderElement.offsetTop + 'px';
        gamePicsEl.appendChild(hiddenImageElement); // Преместване в края на gamePics, за да не влияе на flexbox

        awaitingChoice = true;
        startBtn.classList.add('hidden');
        showMessage('Познай кое липсва!', 'info');
    }

    // Обработка на избора на играча от долните картинки
    function chooseHandler(e) {
        if (!awaitingChoice) return;

        const chosen = e.target.dataset.name;
        const hidden = selectedGamePics[hiddenIndex];

        if (chosen === hidden) {
            showMessage('Браво, Уйли!', 'success');

            // 1. Преместваме скритата картинка обратно към позицията на placeholder-а
            if (hiddenImageElement && placeholderElement) {
                const rect = placeholderElement.getBoundingClientRect();
                const gamePicsRect = gamePicsEl.getBoundingClientRect();

                // Позиционираме img спрямо gamePics контейнера
                hiddenImageElement.style.left = (rect.left - gamePicsRect.left) + 'px';
                hiddenImageElement.style.top = (rect.top - gamePicsRect.top) + 'px';

                // Добавяме transition за плавно движение
                hiddenImageElement.style.transition = 'left 0.5s ease-out, top 0.5s ease-out, opacity 0.5s ease-out';
                hiddenImageElement.classList.remove('is-hidden'); // Правим я видима

                // След като анимацията приключи, връщаме картинката в нормалния поток
                hiddenImageElement.addEventListener('transitionend', function handler() {
                    hiddenImageElement.removeEventListener('transitionend', handler);
                    if (placeholderElement && hiddenImageElement.parentNode === gamePicsEl) {
                         // Връщаме картинката на мястото на placeholder-а в DOM
                        gamePicsEl.replaceChild(hiddenImageElement, placeholderElement);
                        hiddenImageElement.style.position = 'static'; // Връщаме към нормален поток
                        hiddenImageElement.style.transition = ''; // Премахваме transition за бъдещи нормални ховър ефекти
                    }
                    placeholderElement = null; // Изчистваме референцията
                    reloadBtn.classList.remove('hidden');
                    startBtn.classList.add('hidden');
                });
            }
            awaitingChoice = false;
        } else {
            showMessage('Опитай пак!', 'error');
        }
    }

    function showMessage(text, type) {
        messageDisplay.classList.remove('message-animate', 'message-success', 'message-error');
        messageDisplay.style.opacity = 0;
        messageDisplay.style.transform = 'scale(0.8)';

        messageDisplay.textContent = text;
        
        setTimeout(() => {
            messageDisplay.classList.add('message-animate', `message-${type}`);
        }, 50);
    }

    function resetGameState() {
        awaitingChoice = false;
        hiddenIndex = null;
        hiddenImageElement = null;
        if (placeholderElement && placeholderElement.parentNode) {
            placeholderElement.parentNode.removeChild(placeholderElement); // Премахваме placeholder-а
        }
        placeholderElement = null;
        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.', 'info');
        
        // Показване на всички картинки, ако случайно са скрити от предишна игра
        gamePicsEl.querySelectorAll('img').forEach(img => {
            img.classList.remove('is-hidden'); // Използваме клас
            img.style.position = 'static'; // Връщаме всички към static
            img.style.transition = ''; // Премахваме transition
        });
        
        reloadBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.disabled = false;
    }

    // --- Слушатели на събития ---
    themeRadios.forEach(r => r.addEventListener('change', updateStartButtonState));
    countRadios.forEach(r => r.addEventListener('change', updateStartButtonState));
    startGameBtn.addEventListener('click', startGame);
    startBtn.addEventListener('click', hideRandomPicture);
    reloadBtn.addEventListener('click', () => {
        showMessage('', 'info');
        renderGamePics();
        resetGameState();
    });

    // --- Първоначална инициализация при зареждане на страницата ---
    updateStartButtonState();
    document.getElementById('controls').classList.add('hidden');
    containerEl.classList.add('hidden');
});
