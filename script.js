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
    let hiddenImageElement = null;     // Референция към скрития img елемент
    let hiddenIndex = null;            // Индекс на скритата картинка
    let awaitingChoice = false;        // Флаг, указващ дали играчът трябва да избере картинка
    let placeholderElement = null;     // Референция към празното квадратче

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
        resetGameState(); // Гарантираме, че играта е в чисто състояние
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

        // Скриваме бутона "НОВА ИГРА" и показваме "СКРИЙ КАРТИНА"
        reloadBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.disabled = false;
    }

    // Функция за скриване на произволна картинка
    function hideRandomPicture() {
        if (awaitingChoice) return;

        // Reset any previous state for a clean hide
        resetGameState(); // Ensure state is clean before hiding

        hiddenIndex = Math.floor(Math.random() * numberOfPics);
        hiddenImageElement = gamePicsEl.querySelectorAll('img')[hiddenIndex];

        // Създаване на празното квадратче (placeholder)
        placeholderElement = document.createElement('div');
        placeholderElement.classList.add('hidden-placeholder');
        // Размерите му ще дойдат от CSS, но може да ги зададем и тук за сигурност
        placeholderElement.style.width = hiddenImageElement.offsetWidth + 'px';
        placeholderElement.style.height = hiddenImageElement.offsetHeight + 'px';


        // Вмъкване на placeholder-а на мястото на картинката
        gamePicsEl.replaceChild(placeholderElement, hiddenImageElement);

        // Картинката вече е "скрита" от потока чрез replaceChild
        // Сега просто я скриваме визуално с клас
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
                // Премахваме класа, за да се появи отново картинката
                hiddenImageElement.classList.remove('is-hidden');
                
                // Връщаме картинката на мястото на placeholder-а в DOM
                // Това е ключово за да се върне в нормалния поток
                gamePicsEl.replaceChild(hiddenImageElement, placeholderElement);
            }
            awaitingChoice = false;
            reloadBtn.classList.remove('hidden'); // Показваме бутона "НОВА ИГРА"
            startBtn.classList.add('hidden'); // Скриваме "СКРИЙ КАРТИНА"
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

    // Функция за ресетване на състоянието на играта
    function resetGameState() {
        awaitingChoice = false;
        hiddenIndex = null;
        
        // **Важно**: Преди да регенерираме gamePics, трябва да сме сигурни, че
        // скритата картинка и плейсхолдърът са премахнати или върнати правилно.
        if (hiddenImageElement && hiddenImageElement.parentNode) {
            // Ако скритата картинка все още е в DOM (например, ако е била absolute),
            // първо я премахваме, за да не се натрупват елементи.
            if (hiddenImageElement.parentNode === gamePicsEl && hiddenImageElement !== placeholderElement) {
                // Ако hiddenImageElement е пряк наследник на gamePicsEl и не е placeholder-ът
                // (което е валидно само ако е била absolute), премахваме я.
                // В текущата логика с replaceChild това може да е излишно, но е добра защита.
                hiddenImageElement.parentNode.removeChild(hiddenImageElement);
            }
            // По-чист подход: при ресет просто махаме всички стари елементи,
            // renderGamePics ще създаде нови.
        }

        if (placeholderElement && placeholderElement.parentNode) {
            placeholderElement.parentNode.removeChild(placeholderElement);
        }

        hiddenImageElement = null; // Нулираме референцията
        placeholderElement = null; // Нулираме референцията

        // Показване на всички картинки, ако случайно са скрити от предишна игра
        // Тази част е важна, за да се гарантира, че всички img елементи са видими
        // преди renderGamePics да ги пресъздаде.
        gamePicsEl.querySelectorAll('img').forEach(img => {
            img.classList.remove('is-hidden'); // Махаме класа, ако го има
            img.style.transform = ''; // Нулираме всички трансформации
            img.style.transition = ''; // Нулираме всички преходи
        });

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
        renderGamePics(); // Рендираме нови картинки
        resetGameState(); // Ресетваме състоянието
    });

    // --- Първоначална инициализация при зареждане на страницата ---
    // 🚩 РЕШЕНИЕ НА ПРОБЛЕМ 1: Извикваме функцията при зареждане, за да провери първоначалното състояние
    updateStartButtonState(); 

    document.getElementById('controls').classList.add('hidden');
    containerEl.classList.add('hidden');
});
