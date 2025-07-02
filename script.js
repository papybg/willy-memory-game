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
    let hiddenImageElement = null; // Референция към скрития img елемент (който е под overlay-я)
    let hiddenIndex = null;
    let awaitingChoice = false;
    let hideOverlayElement = null; // Референция към наслагващата hide.png картинка

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
        gamePicsEl.innerHTML = ''; // Изчистваме старите картинки

        const shuffledImages = [...currentThemeImages].sort(() => 0.5 - Math.random());
        selectedGamePics = shuffledImages.slice(0, numberOfPics);

        selectedGamePics.forEach((name, idx) => {
            const img = document.createElement('img');
            img.src = 'images/' + name;
            img.dataset.idx = idx;
            img.alt = name.replace('.jpg', '');
            gamePicsEl.appendChild(img);
        });

        // Създаваме overlay елемента само веднъж
        if (!hideOverlayElement) {
            hideOverlayElement = document.createElement('img');
            hideOverlayElement.src = 'images/hide.png'; // Пътя до вашата hide.png картинка
            hideOverlayElement.classList.add('hide-overlay');
            gamePicsEl.appendChild(hideOverlayElement); // Добавяме го в контейнера, но е скрит
        }
        
        reloadBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.disabled = false;
    }

    // Функция за скриване на произволна картинка
    function hideRandomPicture() {
        if (awaitingChoice) return;

        resetGameState(); // Гарантираме чисто състояние преди скриване

        hiddenIndex = Math.floor(Math.random() * numberOfPics);
        hiddenImageElement = gamePicsEl.querySelectorAll('img')[hiddenIndex]; // Взимаме референция към картинката, която ще скрием

        // Позиционираме hideOverlayElement точно над скритата картинка
        const imgRect = hiddenImageElement.getBoundingClientRect();
        const gamePicsRect = gamePicsEl.getBoundingClientRect();

        hideOverlayElement.style.top = `${imgRect.top - gamePicsRect.top}px`;
        hideOverlayElement.style.left = `${imgRect.left - gamePicsRect.left}px`;
        
        // Показваме overlay картинката плавно
        hideOverlayElement.classList.add('is-visible');

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
            
            // Скриваме hide-overlay елемента плавно
            if (hideOverlayElement) {
                hideOverlayElement.classList.remove('is-visible');
            }
            awaitingChoice = false;
            reloadBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');
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
        hiddenImageElement = null; // Референцията се нулира за следваща игра

        // Скриваме hide-overlay, ако е видим
        if (hideOverlayElement) {
            hideOverlayElement.classList.remove('is-visible');
        }

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
        renderGamePics(); // Това ще пресъздаде всички картинки и ще реши проблема със скрита картинка
        resetGameState();
    });

    // --- Първоначална инициализация при зареждане на страницата ---
    updateStartButtonState(); 

    document.getElementById('controls').classList.add('hidden');
    containerEl.classList.add('hidden');
});
