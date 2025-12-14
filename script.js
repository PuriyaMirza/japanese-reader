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
    
    // Simple word boundary detection
    // Split by spaces, but also try to keep multi-character sequences together
    const words = segmentText(text);
    
    readingArea.innerHTML = '';
    
    words.forEach(word => {
        if (word.trim() === '') {
            readingArea.appendChild(document.createTextNode(word));
        } else {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = word;
            span.addEventListener('click', () => lookupWord(word));
            readingArea.appendChild(span);
        }
    });
}

function segmentText(text) {
    // Basic segmentation: split by common punctuation and spaces
    // Keep words together when possible
    const segments = [];
    let currentWord = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // Check if it's punctuation or whitespace
        if (char.match(/[\s、。！？,.!?]/)) {
            if (currentWord) {
                segments.push(currentWord);
                currentWord = '';
            }
            segments.push(char);
        } else {
            currentWord += char;
        }
    }
    
    if (currentWord) {
        segments.push(currentWord);
    }
    
    return segments;
}

async function lookupWord(word) {
    popupWord.textContent = word;
    popupDefinition.innerHTML = '<em>Loading...</em>';
    definitionPopup.classList.remove('hidden');
    
    try {
        // Call Jisho API
        const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            displayDefinition(data.data[0]);
        } else {
            popupDefinition.innerHTML = '<em>No definition found. Try selecting a different word or phrase.</em>';
        }
    } catch (error) {
        popupDefinition.innerHTML = 
