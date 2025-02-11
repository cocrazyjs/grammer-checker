document.getElementById('checkButton').addEventListener('click', function () {
  const inputText = document.getElementById('inputText').value;
  const outputText = document.getElementById('outputText');

  // Call the LanguageTool API
  checkGrammar(inputText)
    .then(correctedText => {
      outputText.innerHTML = correctedText;
    })
    .catch(error => {
      outputText.innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
    });
});

async function checkGrammar(text) {
  const apiUrl = 'https://api.languagetool.org/v2/check';
  const language = 'en-US'; // Set language to English (US)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `text=${encodeURIComponent(text)}&language=${language}`,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch grammar corrections');
    }

    const data = await response.json();

    // Apply corrections to the text
    return applyCorrections(text, data.matches);
  } catch (error) {
    throw new Error('Error checking grammar: ' + error.message);
  }
}

function applyCorrections(text, matches) {
  let correctedText = text;

  // Sort matches by offset in reverse order to avoid messing up offsets
  matches.sort((a, b) => b.offset - a.offset);

  // Apply corrections
  matches.forEach(match => {
    const start = match.offset;
    const end = match.offset + match.length;
    const incorrect = text.slice(start, end);
    const correct = match.replacements[0]?.value || incorrect;

    // Highlight the incorrect word and show the correction
    correctedText =
      correctedText.slice(0, start) +
      `<span class="highlight" title="Suggested correction: ${correct}">${incorrect}</span>` +
      correctedText.slice(end);
  });

  return correctedText;
}