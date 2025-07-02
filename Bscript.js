// script.js
document.addEventListener('DOMContentLoaded', () => {
    // 🎯 Дефиниции на темите и техните изображения
    const ALL_THEMES = {
        // Променено от 'cars' на 'превозни_средства'
        превозни_средства: ['bus.jpg', 'airplane.jpg', 'firetruck.jpg', 'train.jpg', 'truck.jpg'],
        animals: ['dog.jpg', 'cat.jpg', 'lion.jpg', 'elephant.jpg', 'monkey.jpg'], // Примерни изображения за животни
        flowers: ['rose.jpg', 'tulip.jpg', 'lily.jpg', 'daisy.jpg', 'sunflower.jpg'] // Примерни изображения за цветя
    };

    // 🎯 DOM елементи
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const countRadios = document.querySelectorAll('input[name="count"]');
    const startGameBtn = document.getElementById('startGameBtn');
    const optionsContainer = document.getElementById('optionsContainer'); // Общ контейнер за опциите

    const gameTitleEl = document.getElementById('gameTitle');
    const messageDisplay = document.getElementById('gameMessage'); // Сега вече с id="gameMessage"
    const startBtn = document.getElementById('start');
    const reloadBtn = document.getElementById('reload');
    const allPicsEl = document.getElementById('allPics');
    const gamePicsEl = document.getElementById('gamePics');
    const containerEl = document.getElementById('container'); // Игрово поле

    // 🎯 Променливи за състоянието на играта
    let currentThemeImages = [];
    let numberOfPics = 0; // Брой картинки за играта (от избора на потребителя)
    let selectedGamePics = []; // Картинките, избрани за горната редица
    let hiddenImageElement = null; // Референция към скрития img елемент
    let hiddenIndex = null; // Индекс на скритата картинка
    let awaitingChoice = false; // Флаг, указващ дали играчът трябва да избере картинка

    // --- Функции ---

    // Функция за актуализиране на състоянието на бутона "Започни играта"
    function updateStartButtonState() {
        const themeSelected = Array.from(themeRadios).some(r => r.checked);
        const countSelected = Array.from(countRadios).some(r => r.checked);
        startGameBtn.disabled = !(themeSelected && countSelected);
    }

    // Функция за стартиране на играта след избор на опции
    function startGame() {
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
        numberOfPics = parseInt(document.querySelector('input[name="count"]:checked').value);

        currentThemeImages = ALL_THEMES[selectedTheme];

        // 📝 Динамично обновяване на заглавието и показване на съобщение
        // selectedTheme.replace('_', ' ') ще замени долното тире с интервал
        gameTitleEl.textContent = `Познай ${selectedTheme.replace('_', ' ').toUpperCase()}!`;
        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.', 'info'); // Използваме showMessage

        // 📝 Скриване на опциите и показване на игралното поле
        optionsContainer.classList.add('hidden'); // Скриваме целия контейнер с опциите
        startGameBtn.classList.add('hidden'); // Скриваме и бутона

        document.getElementById('controls').classList.remove('hidden'); // Показваме контролите (СТАРТ/РЕЛОАД)
        containerEl.classList.remove('hidden'); // Показваме игровото поле

        renderGamePics(); // Рендираме горните картинки за играта
        renderAllPics();  // Рендираме долните картинки за избор
        resetGameState(); // Ресетваме състоянието на играта
    }

    // Функция за рендиране на всички картинки (долната редица за избор)
    function renderAllPics() {
        allPicsEl.innerHTML = '';
        currentThemeImages.forEach(name => {
            const img = document.createElement('img');
            img.src = 'images/' + name;
            img.dataset.name = name;
            img.alt = name.replace('.jpg', ''); // Алтернативен текст за достъпност
            img.addEventListener('click', chooseHandler);
            allPicsEl.appendChild(img);
        });
    }

    // Функция за рендиране на картинките за игра (горната редица)
    function renderGamePics() {
        gamePicsEl.innerHTML = '';
        // Разбъркване и избор на `numberOfPics` на брой картинки от текущата тема
        const shuffledImages = [...currentThemeImages].sort(() => 0.5 - Math.random());
        selectedGamePics = shuffledImages.slice(0, numberOfPics);

        selectedGamePics.forEach((name, idx) => {
            const img = document.createElement('img');
            img.src = 'images/' + name;
            img.dataset.idx = idx;
            img.alt = name.replace('.jpg', '');
            gamePicsEl.appendChild(img);
        });

        reloadBtn.classList.add('hidden'); // Скриване на бутона "НОВА ИГРА" при ново зареждане
        startBtn.classList.remove('hidden'); // Показване на бутона "СКРИЙ КАРТИНА"
        startBtn.disabled = false; // Активиране на бутон "СКРИЙ КАРТИНА"
    }

    // Функция за скриване на произволна картинка
    function hideRandomPicture() {
        if (awaitingChoice) return; // Ако вече се чака избор, не прави нищо

        hiddenIndex = Math.floor(Math.random() * numberOfPics);
        hiddenImageElement = gamePicsEl.querySelectorAll('img')[hiddenIndex]; // Записваме референция
        hiddenImageElement.classList.add('hidden-picture'); // Добавяме клас за плавно скриване

        awaitingChoice = true; // Играчът трябва да направи избор
        startBtn.classList.add('hidden'); // Скриване на бутона "СКРИЙ КАРТИНА" след като картинката е скрита
        // Променено съобщение
        showMessage('Познай кое липсва!', 'info');
    }

    // Обработка на избора на играча от долните картинки
    function chooseHandler(e) {
        if (!awaitingChoice) return; // Ако не се чака избор, не прави нищо

        const chosen = e.target.dataset.name;
        const hidden = selectedGamePics[hiddenIndex];

        if (chosen === hidden) {
            showMessage('Браво, Уйли!', 'success'); // Съобщение за успех
            // Плавно връщане на скритата картинка
            if (hiddenImageElement) {
                hiddenImageElement.classList.remove('hidden-picture'); // Премахваме класа
                // Може да добавите и кратък setTimeout преди reloadBtn.classList.remove('hidden');
                // за да се види анимацията преди бутонът да се появи.
            }
            awaitingChoice = false;
            reloadBtn.classList.remove('hidden'); // Показване на бутона "НОВА ИГРА"
            startBtn.classList.add('hidden'); // Уверете се, че СТАРТ е скрит
        } else {
            showMessage('Опитай пак!', 'error'); // Съобщение за грешка
        }
    }

    // Нова функция за показване на анимирани съобщения
    function showMessage(text, type) {
        // Изчистване на стари класове и анимации
        messageDisplay.classList.remove('message-animate', 'message-success', 'message-error');
        messageDisplay.style.opacity = 0; // Ресетване на opacity за ре-анимация
        messageDisplay.style.transform = 'scale(0.8)'; // Ресетване на scale

        messageDisplay.textContent = text;
        
        // Добавяне на клас за тип съобщение и стартиране на анимация
        // Използваме setTimeout за да дадем време на браузъра да регистрира ресета
        setTimeout(() => {
            messageDisplay.classList.add('message-animate', `message-${type}`);
        }, 50); // Малко закъснение
    }

    // Функция за ресетване на състоянието на играта
    function resetGameState() {
        awaitingChoice = false;
        hiddenIndex = null;
        hiddenImageElement = null; // Ресетваме и референцията
        showMessage('Натисни "СКРИЙ КАРТИНА" за да започнеш.', 'info'); // Ресет съобщение
        
        // Показване на всички картинки, ако случайно са скрити от предишна игра
        gamePicsEl.querySelectorAll('img').forEach(img => img.classList.remove('hidden-picture')); // Използваме клас
        
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
        showMessage('', 'info'); // Изчистване на съобщението
        renderGamePics(); // Рестарт на играта с текущата тема и брой
        resetGameState(); // Ресетване на състоянието за нова игра
    });

    // --- Първоначална инициализация при зареждане на страницата ---
    updateStartButtonState(); // Проверява дали бутонът за старт трябва да е активен
    // Скриване на контролите и игровото поле докато не започне играта
    document.getElementById('controls').classList.add('hidden');
    containerEl.classList.add('hidden');
});
