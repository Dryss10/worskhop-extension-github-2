document.getElementById('colorPicker').addEventListener('input', (e) => {
    const color = e.target.value;
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'setColor', color });
    });
});

document.getElementById('dynamicButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'setDynamicBackground' });
    });
});

