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
        const response = await fetch(`/api/jisho?keyword=${encodeURIComponent(word)}`);
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

async function playAudio(text) {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    const data = await response.json();
    
    // Google returns base64 encoded audio
    const audio = new Audio('data:audio/mp3;base64,' + data.audioContent);
    audio.play();
  } catch (error) {
    console.error('Audio playback failed:', error);
  }
}


function hidePopup() {
    definitionPopup.classList.add('hidden');
}

// Vocab Saver Feature
let savedVocab = JSON.parse(localStorage.getItem('savedVocab')) || [];
let currentEntry = null;

const saveWordBtn = document.getElementById('save-word');
const exportBtn = document.getElementById('export-vocab');
const vocabList = document.getElementById('vocab-list');

saveWordBtn.addEventListener('click', saveCurrentWord);
exportBtn.addEventListener('click', exportToCSV);

function displayDefinition(entry) {
    currentEntry = entry;
    let html = '';
    
   if (entry.japanese && entry.japanese.length > 0) {
    const reading = entry.japanese.reading;
    const word = popupWord.textContent;
    if (reading) {
        html += `<div style="color: #667eea; font-size: 18px; margin-bottom: 10px;">
            ${reading} 
            <button onclick="playAudio('${word}')" style="background: none; border: none; font-size: 24px; cursor: pointer; margin-left: 10px;">🔊</button>
        </div>`;
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
    
    const word = popupWord.textContent;
    const isAlreadySaved = savedVocab.some(item => item.word === word);
    saveWordBtn.textContent = isAlreadySaved ? '✓ Saved' : '💾 Save Word';
    saveWordBtn.className = isAlreadySaved ? 'save-word-btn saved' : 'save-word-btn';
}

function saveCurrentWord() {
    if (!currentEntry) return;
    
    const word = popupWord.textContent;
    const reading = currentEntry.japanese?.[0]?.reading || '';
    const definition = currentEntry.senses?.[0]?.english_definitions.join(', ') || '';
    
    if (savedVocab.some(item => item.word === word)) {
        return;
    }
    
    const vocabItem = { word, reading, definition, date: new Date().toISOString() };
    savedVocab.push(vocabItem);
    localStorage.setItem('savedVocab', JSON.stringify(savedVocab));
    
    renderVocabList();
    saveWordBtn.textContent = '✓ Saved';
    saveWordBtn.className = 'save-word-btn saved';
}

function renderVocabList() {
    if (savedVocab.length === 0) {
        vocabList.innerHTML = '<p class="empty-message">No saved words yet. Click "Save Word" when you look up a word!</p>';
        return;
    }
    
    vocabList.innerHTML = savedVocab.map((item, index) => `
        <div class="vocab-item">
            <button class="vocab-delete" onclick="deleteVocab(${index})">Delete</button>
            <div class="vocab-word">${item.word}</div>
            <div class="vocab-reading">${item.reading}</div>
            <div class="vocab-definition">${item.definition}</div>
        </div>
    `).join('');
}

function deleteVocab(index) {
    savedVocab.splice(index, 1);
    localStorage.setItem('savedVocab', JSON.stringify(savedVocab));
    renderVocabList();
}


function exportToCSV() {
    if (savedVocab.length === 0) {
        alert('No vocab to export!');
        return;
    }
    
    const csv = 'Word,Reading,Definition\n' + savedVocab.map(item => 
        `"${item.word}","${item.reading}","${item.definition}"`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'japanese-vocab.csv';
    a.click();
    URL.revokeObjectURL(url);
}

renderVocabList();
