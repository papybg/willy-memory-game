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
        // Размерите му ще дойдат от CSS

        // 2. Вмъкване на placeholder-а на мястото на картинката
        gamePicsEl.replaceChild(placeholderElement, hiddenImageElement);

        // 3. Изчисляване на разстоянието до центъра на gamePics (или удобно извън екрана)
        // За да се движи от allPics към placeholder-а
        // Нека я скрием извън екрана, преди да я анимираме обратно
        // Можем да използваме позиция спрямо allPics за по-реалистично "влизане"
        const allPicsRect = allPicsEl.getBoundingClientRect();
        const hiddenImgRect = hiddenImageElement.getBoundingClientRect(); // Текущата позиция на скритата картинка

        // Изчисляване на преместване от текущата позиция до извън gamePics
        // Например, на 2 пъти височината на екрана над gamePics
        const moveY = -(hiddenImgRect.top + hiddenImgRect.height + window.innerHeight * 0.5); // Пример за преместване нагоре извън екрана
        const moveX = 0; // Или някаква случайна X позиция за по-интересен ефект

        hiddenImageElement.style.setProperty('--move-x', `${moveX}px`);
        hiddenImageElement.style.setProperty('--move-y', `${moveY}px`);
        
        hiddenImageElement.classList.add('is-hidden'); // Прилага opacity: 0 и transform

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

            if (hiddenImageElement && placeholderElement) {
                // Премахваме класа за скриване, за да започне анимацията
                hiddenImageElement.classList.remove('is-hidden');

                // Слушаме края на анимацията
                hiddenImageElement.addEventListener('transitionend', function handler() {
                    hiddenImageElement.removeEventListener('transitionend', handler);
                    
                    // След като анимацията приключи, връщаме картинката на мястото на placeholder-а в DOM
                    if (placeholderElement && placeholderElement.parentNode === gamePicsEl) {
                        gamePicsEl.replaceChild(hiddenImageElement, placeholderElement);
                    }
                    // Нулираме всички трансформации и преходи, за да не пречат на нормалните ховър ефекти
                    hiddenImageElement.style.transform = '';
                    hiddenImageElement.style.transition = '';
                    hiddenImageElement.style.setProperty('--move-x', '0px');
                    hiddenImageElement.style.setProperty('--move-y', '0px');


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
        
        // Връщаме всички картинки, които може да са били скрити, в изходно положение
        gamePicsEl.querySelectorAll('img').forEach(img => {
            img.classList.remove('is-hidden');
            img.style.transform = ''; // Нулираме трансформациите
            img.style.transition = ''; // Нулираме преходите
        });

        // Ако има placeholder, премахваме го
        if (placeholderElement && placeholderElement.parentNode) {
            placeholderElement.parentNode.removeChild(placeholderElement);
        }
        placeholderElement = null; // Ресетваме и референцията

        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.', 'info');
        
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
    // 🚩 РЕШЕНИЕ НА ПРОБЛЕМ 1: Извикваме функцията при зареждане, за да провери първоначалното състояние
    updateStartButtonState(); 

    document.getElementById('controls').classList.add('hidden');
    containerEl.classList.add('hidden');
});
