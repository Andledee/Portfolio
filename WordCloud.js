// ─── External Libraries ────────────────────────────────────────────────────
// wordcloud2.js  – renders the word cloud onto a canvas/div
// mammoth.js     – extracts text from .docx files
// Both are loaded dynamically below so no separate <script> tags are needed.

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
    });
}

// ─── Stop Words ────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
    'a','about','above','after','again','against','all','am','an','and','any',
    'are',"aren't",'as','at','be','because','been','before','being','below',
    'between','both','but','by',"can't",'cannot','could',"couldn't",'did',
    "didn't",'do','does',"doesn't",'doing',"don't",'down','during','each',
    'few','for','from','further','get','got','had',"hadn't",'has',"hasn't",
    'have',"haven't",'having','he',"he'd","he'll","he's",'her','here',
    "here's",'hers','herself','him','himself','his','how',"how's",'i',"i'd",
    "i'll","i'm","i've",'if','in','into','is',"isn't",'it',"it's",'its',
    'itself',"let's",'me','more','most',"mustn't",'my','myself','no','nor',
    'not','of','off','on','once','only','or','other','ought','our','ours',
    'ourselves','out','over','own','same',"shan't",'she',"she'd","she'll",
    "she's",'should',"shouldn't",'so','some','such','than','that',"that's",
    'the','their','theirs','them','themselves','then','there',"there's",
    'these','they',"they'd","they'll","they're","they've",'this','those',
    'through','to','too','under','until','up','very','was',"wasn't",'we',
    "we'd","we'll","we're","we've",'were',"weren't",'what',"what's",'when',
    "when's",'where',"where's",'which','while','who',"who's",'whom','why',
    "why's",'with',"won't",'would',"wouldn't",'you',"you'd","you'll",
    "you're","you've",'your','yours','yourself','yourselves', 
]);

// ─── Word Frequency ────────────────────────────────────────────────────────
function getWordFrequencies(text, maxWords) {
    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9'\s-]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.has(w));

    const freq = {};
    for (const word of words) {
        freq[word] = (freq[word] || 0) + 1;
    }

    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxWords);
}

// ─── Color Helpers ─────────────────────────────────────────────────────────
const RAINBOW_COLORS = [
    '#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6'
];
let rainbowIndex = 0;

function getColorFunction(colorChoice) {
    if (colorChoice === 'rainbow') {
        rainbowIndex = 0;
        return () => RAINBOW_COLORS[rainbowIndex++ % RAINBOW_COLORS.length];
    }
    return colorChoice;
}

// ─── Gradient Helper ───────────────────────────────────────────────────────
// Apply gradient as a CSS background so WordCloud's canvas drawing
// never paints over it — the gradient lives behind the canvas pixels.
function applyGradientToCanvas(canvas, color1, color2, direction) {
    canvas.style.background = `linear-gradient(${direction}, ${color1}, ${color2})`;
}

// ─── Gradient Button Feedback ──────────────────────────────────────────────
function setGradientButtonState(active) {
    const btn = document.getElementById('applyGradient');
    if (active) {
        btn.textContent = '✓ Gradient Active';
        btn.style.backgroundColor = '#4caf50';
    } else {
        btn.textContent = 'Use Gradient';
        btn.style.backgroundColor = '';
    }
}

// ─── Render ────────────────────────────────────────────────────────────────
function renderWordCloud(text) {
    const maxWords   = parseInt(document.getElementById('maxWords').value, 10) || 100;
    const textColor  = document.getElementById('textColorChoices').value;
    const bgColor    = document.getElementById('backgroundColorChoices').value;
    const fontFamily = document.getElementById('fontStyle').value;

    const usingGradient = window._useGradient || false;
    const gradColor1    = document.getElementById('gradientColor1').value;
    const gradColor2    = document.getElementById('gradientColor2').value;
    const gradDir       = document.getElementById('gradientDirection').value;

    const wordList = getWordFrequencies(text, maxWords);

    if (wordList.length === 0) {
        alert('No words found. Please enter some text or upload a file.');
        return;
    }

    // Prepare the container
    const outer = document.getElementById('wordCloudContainer');
    const container = document.getElementById('wordCloud');
    container.innerHTML = '';

    // Apply background to the OUTER container div so it always fills edge to edge.
    // The canvas uses backgroundColor:'transparent' so words paint over it.
    if (usingGradient) {
        outer.style.background = `linear-gradient(${gradDir}, ${gradColor1}, ${gradColor2})`;
    } else {
        outer.style.background = bgColor;
    }

    // Size canvas to match the outer container exactly.
    const canvasWidth  = outer.clientWidth || 800;
    const canvasHeight = Math.min(900, Math.max(400, wordList.length * 6));
    outer.style.height = canvasHeight + 'px';

    const canvas = document.createElement('canvas');
    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width  = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    // Scale font sizes relative to the top frequency
    const maxFreq = wordList[0][1];
    const scaledList = wordList.map(([word, freq]) => [
        word,
        Math.max(12, Math.round((freq / maxFreq) * 80))
    ]);

    WordCloud(canvas, {
        list:            scaledList,
        fontFamily:      fontFamily,
        color:           getColorFunction(textColor),
        backgroundColor: 'transparent',
        rotateRatio:     0.3,
        rotationSteps:   2,
        shuffle:         true,
        drawOutOfBound:  false,
        shrinkToFit:     true,
    });
}

// ─── File Reading ──────────────────────────────────────────────────────────
function readFile(file) {
    return new Promise((resolve, reject) => {
        if (file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload  = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Could not read text file.'));
            reader.readAsText(file);

        } else if (file.name.endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = async e => {
                try {
                    const result = await mammoth.extractRawText({
                        arrayBuffer: e.target.result
                    });
                    resolve(result.value);
                } catch (err) {
                    reject(new Error('Could not parse .docx file.'));
                }
            };
            reader.onerror = () => reject(new Error('Could not read .docx file.'));
            reader.readAsArrayBuffer(file);

        } else {
            reject(new Error('Unsupported file type. Please upload a .txt or .docx file.'));
        }
    });
}

// ─── Main Entry Point ──────────────────────────────────────────────────────
async function main() {
    try {
        await Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/wordcloud2.js/1.2.2/wordcloud2.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'),
        ]);
    } catch (err) {
        alert('Failed to load required libraries. Please check your internet connection.');
        console.error(err);
        return;
    }

    // FIX 3: Give visual feedback when gradient is active/inactive
    document.getElementById('applyGradient').addEventListener('click', () => {
    window._useGradient = !window._useGradient;
    setGradientButtonState(window._useGradient);
    if (!window._useGradient) {
        // restore the solid dropdown value visually
        document.getElementById('backgroundColorChoices').value = 'white';
    }
});

    document.getElementById('backgroundColorChoices').addEventListener('change', () => {
        window._useGradient = false;
        setGradientButtonState(false);
    });

    document.getElementById('generateButton').addEventListener('click', async () => {
        const textarea  = document.getElementById('textInputArea').value.trim();
        const fileInput = document.getElementById('fileInput');
        const file      = fileInput.files[0];

        let text = '';

        if (file) {
            try {
                text = await readFile(file);
            } catch (err) {
                alert(err.message);
                return;
            }
        } else if (textarea) {
            text = textarea;
        } else {
            alert('Please enter some text or upload a file first.');
            return;
        }

        renderWordCloud(text);
    });
}

main();