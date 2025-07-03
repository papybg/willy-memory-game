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
    let hiddenImageElement = null; // Референция към СКРИТИЯ оригинален img елемент
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
        // ВАЖНО: resetGameState се извиква след renderGamePics, за да гарантира, че всички картинки са видими и overlay-ят е скрит
        // Забавяме го малко, за да се гарантира, че renderGamePics е завършил и DOM е готов
        setTimeout(() => {
            resetGameState(); 
        }, 100); 
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

        // Създаваме overlay елемента само веднъж и го добавяме към gamePicsEl
        if (!hideOverlayElement) {
            hideOverlayElement = document.createElement('img');
            hideOverlayElement.src = 'images/hide.png'; // Пътя до вашата hide.png картинка
            hideOverlayElement.classList.add('hide-overlay');
            gamePicsEl.appendChild(hideOverlayElement); // Добавяме го в контейнера, но е скрит от CSS
        }
        
        // Ensure the overlay is hidden and reset when new game pics are rendered
        hideOverlayElement.classList.remove('is-visible');
        hideOverlayElement.style.top = ''; 
        hideOverlayElement.style.left = '';
    }

    // Функция за скриване на произволна картинка
    function hideRandomPicture() {
        if (awaitingChoice) return;

        // Първо нулираме предишното състояние, ако има такова (ако е имало предишно скриване)
        // Това е за случаи, когато играчът натисне "СКРИЙ КАРТИНА" отново, без да е познал предишната
        if (hiddenImageElement && hideOverlayElement.classList.contains('is-visible')) {
            // Ако има вече скрита картинка и овърлеят е видим, върни оригиналната видима
            hiddenImageElement.style.opacity = '1';
            hiddenImageElement.style.visibility = 'visible';
            hiddenImageElement.style.pointerEvents = 'auto';
            hideOverlayElement.classList.remove('is-visible');
            hideOverlayElement.style.top = ''; 
            hideOverlayElement.style.left = '';
            hiddenImageElement = null; // Нулираме я
        }


        hiddenIndex = Math.floor(Math.random() * numberOfPics);
        hiddenImageElement = gamePicsEl.querySelectorAll('img')[hiddenIndex]; // Взимаме референция към картинката, която ще скрием

        // *КОРЕКЦИЯ*: Скриваме оригиналната картинка
        hiddenImageElement.style.opacity = '0';
        hiddenImageElement.style.visibility = 'hidden';
        hiddenImageElement.style.pointerEvents = 'none'; // Прави я некликаема

        // *КОРЕКЦИЯ*: Позиционираме hideOverlayElement спрямо offsetLeft/offsetTop на целевия елемент
        // спрямо родителя (gamePicsEl). Това е по-стабилно при скрол и различни позиционирания
        hideOverlayElement.style.top = `${hiddenImageElement.offsetTop}px`;
        hideOverlayElement.style.left = `${hiddenImageElement.offsetLeft}px`;
        
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
                // Изчистваме инлайн стиловете за позиция, за да не пречат при следващо позициониране
                hideOverlayElement.style.top = ''; 
                hideOverlayElement.style.left = '';
            }

            // *КОРЕКЦИЯ*: Показваме оригиналната картинка
            if (hiddenImageElement) {
                hiddenImageElement.style.opacity = '1';
                hiddenImageElement.style.visibility = 'visible';
                hiddenImageElement.style.pointerEvents = 'auto'; // Прави я кликаема отново
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
        
        // *КОРЕКЦИЯ*: Покажи всички картинки в #gamePics, ако са скрити
        gamePicsEl.querySelectorAll('img').forEach(img => {
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            img.style.pointerEvents = 'auto';
        });

        // Скриваме hide-overlay, ако е видим
        if (hideOverlayElement) {
            hideOverlayElement.classList.remove('is-visible'); // Скрива го
            // Изчистваме инлайн стиловете за позиция
            hideOverlayElement.style.top = ''; 
            hideOverlayElement.style.left = '';
        }

        // Нулираме референцията към скритата картинка за следваща игра
        hiddenImageElement = null; 

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
        showMessage('', 'info'); // Изчиства съобщението
        // renderGamePics() вече изчиства и скрива overlay-я
        renderGamePics(); // Това ще пресъздаде всички картинки
        resetGameState(); // Гарантира чисто състояние и скрит overlay
    });

    // --- Първоначална инициализация при зареждане на страницата ---
    updateStartButtonState(); 

    document.getElementById('controls').classList.add('hidden');
    containerEl.classList.add('hidden');
});
