// Hardcoded test dictionary for Phase 1
const testDictionary = {
    'こんにちは': 'Hello, Good afternoon',
    'ありがとう': 'Thank you',
    '日本': 'Japan',
    '勉強': 'Study',
    'です': 'is, am, are (polite copula)',
    '私': 'I, me',
    'これ': 'this',
    '本': 'book'
};

const loadButton = document.getElementById('load-text');
const japaneseInput = document.getElementById('japanese-input');
const readingArea = document.getElementById('reading-area');
const definitionPopup = document.getElementById('definition-popup');
const closePopup = document.getElementById('close-popup');
const popupWord = document.getElementById('popup-word');
const popupDefinition = document.getElementById('popup-definition');

loadButton.addEventListener('click', loadText);
closePopup.addEventListener('click', hidePopup);

function loadText() {
    const text = japaneseInput.value.trim();
    
    if (!text) {
        alert('Please paste some Japanese text first!');
        return;
    }
    
    const characters = text.split('');
    readingArea.innerHTML = '';
    
    characters.forEach(char => {
        if (char.trim() === '') {
            readingArea.appendChild(document.createTextNode(char));
        } else {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = char;
            span.addEventListener('click', () => showDefinition(char));
            readingArea.appendChild(span);
        }
    });
}

function showDefinition(word) {
    popupWord.textContent = word;
    
    if (testDictionary[word]) {
        popupDefinition.textContent = testDictionary[word];
    } else {
        popupDefinition.textContent = 'Definition not found (API integration coming in Phase 2!)';
    }
    
    definitionPopup.classList.remove('hidden');
}

function hidePopup() {
    definitionPopup.classList.add('hidden');
}
