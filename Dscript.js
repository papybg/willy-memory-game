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
    let hiddenImageElement = null;
    let hiddenIndex = null;
    let originalHiddenImageSrc = '';
    let originalHiddenImageName = '';
    let awaitingChoice = false;

    // НОВО: Аудио елементи за успех и грешка
    const bravoAudio = new Audio('audio/bravo_uily.wav'); 
    const opitaiPakAudio = new Audio('audio/opitaj_pak.wav'); // НОВО: Пътят към новия WAV файл

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
            img.dataset.name = name;
            img.alt = name.replace('.jpg', '');
            gamePicsEl.appendChild(img);
        });
    }

    function hideRandomPicture() {
        if (awaitingChoice) return;

        if (hiddenImageElement && hiddenImageElement.src.includes('hide.png')) {
            hiddenImageElement.src = originalHiddenImageSrc;
            hiddenImageElement.dataset.name = originalHiddenImageName;
            hiddenImageElement.alt = originalHiddenImageName.replace('.jpg', '');
        }

        hiddenIndex = Math.floor(Math.random() * numberOfPics);
        hiddenImageElement = gamePicsEl.querySelectorAll('img')[hiddenIndex]; 

        originalHiddenImageSrc = hiddenImageElement.src;
        originalHiddenImageName = hiddenImageElement.dataset.name;

        hiddenImageElement.src = 'images/hide.png';
        hiddenImageElement.dataset.name = 'hide.png';
        hiddenImageElement.alt = 'Скрита картинка';
        
        awaitingChoice = true;
        startBtn.classList.add('hidden');
        showMessage('Познай кое липсва!', 'info');
    }

    function chooseHandler(e) {
        if (!awaitingChoice) return;

        const chosen = e.target.dataset.name;
        const hidden = originalHiddenImageName; 

        if (chosen === hidden) {
            showMessage('Браво, Уйли!', 'success');
            
            bravoAudio.currentTime = 0; 
            bravoAudio.play().catch(e => console.error("Error playing audio:", e));
            
            if (hiddenImageElement) {
                hiddenImageElement.src = originalHiddenImageSrc;
                hiddenImageElement.dataset.name = originalHiddenImageName;
                hiddenImageElement.alt = originalHiddenImageName.replace('.jpg', '');
            }

            awaitingChoice = false;
            reloadBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');
        } else {
            showMessage('Опитай пак!', 'error');
            // НОВО: Възпроизвеждане на аудиото за грешен отговор
            opitaiPakAudio.currentTime = 0; 
            opitaiPakAudio.play().catch(e => console.error("Error playing audio:", e));
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
        
        if (hiddenImageElement && hiddenImageElement.src.includes('hide.png')) {
            hiddenImageElement.src = originalHiddenImageSrc;
            hiddenImageElement.dataset.name = originalHiddenImageName;
            hiddenImageElement.alt = originalHiddenImageName.replace('.jpg', '');
        }
        
        hiddenImageElement = null; 
        originalHiddenImageSrc = '';
        originalHiddenImageName = '';

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
    updateStartButtonState(); 

    document.getElementById('controls').classList.add('hidden');
    containerEl.classList.add('hidden');
});
