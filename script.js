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
    const segments = [];
    let currentWord = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
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
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://jisho.org/api/v1/search/words?keyword=' + word)}`);

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            displayDefinition(data.data[0]);
        } else {
            popupDefinition.innerHTML = '<em>No definition found. Try selecting a different word or phrase.</em>';
        }
    } catch (error) {
        popupDefinition.innerHTML = '<em>Error loading definition. Please check your internet connection.</em>';
        console.error('Jisho API error:', error);
    }
}

function displayDefinition(entry) {
    let html = '';
    
    if (entry.japanese && entry.japanese.length > 0) {
        const reading = entry.japanese[0].reading;
        if (reading) {
            html += `<div style="color: #667eea; font-size: 18px; margin-bottom: 10px;">${reading}</div>`;
        }
    }
    
    if (entry.senses && entry.senses.length > 0) {
        entry.senses.slice(0, 3).forEach((sense, index) => {
            const definitions = sense.english_definitions.join(', ');
            const partOfSpeech = sense.parts_of_speech.join(', ');
            
            html += `<div style="margin-bottom: 12px;">`;
            html += `<strong>${index + 1}.</strong> ${definitions}`;
            if (partOfSpeech) {
                html += `<br><small style="color: #999;">(${partOfSpeech})</small>`;
            }
            html += `</div>`;
        });
    }
    
    popupDefinition.innerHTML = html;
}

function hidePopup() {
    definitionPopup.classList.add('hidden');
}
