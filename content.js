// Load saved background when page loads
chrome.storage.local.get(['savedColor', 'savedImage'], function(result) {
  console.log('Content script loading saved background:', result);
  if (result.savedImage) {
    console.log('Attempting to load saved image');
    const img = new Image();
    img.onload = function() {
      console.log('Saved image loaded successfully');
      document.body.style.backgroundImage = `url(${result.savedImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    };
    img.onerror = function(error) {
      console.error('Failed to load saved background image:', error);
      // If image fails to load, remove it from storage
      chrome.storage.local.remove(['savedImage']);
    };
    img.src = result.savedImage;
  } else if (result.savedColor) {
    console.log('Loading saved color:', result.savedColor);
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = result.savedColor;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message.action);
    
    if (message.action === 'setColor') {
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = message.color;
      // Save the color to storage
      chrome.storage.local.set({ savedColor: message.color });
      // Remove saved image when setting color
      chrome.storage.local.remove(['savedImage']);
    }
    else if (message.action === 'setImage') {
      console.log('Setting new image, data length:', message.imageData.length);
      const img = new Image();
      img.onload = function() {
        console.log('New image loaded successfully');
        document.body.style.backgroundImage = `url(${message.imageData})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
      };
      img.onerror = function(error) {
        console.error('Failed to load new image:', error);
        // If image fails to load, remove it from storage
        chrome.storage.local.remove(['savedImage']);
      };
      img.src = message.imageData;
    }
    else if (message.action === 'removeImage') {
      console.log('Removing image from content script');
      document.body.style.backgroundImage = 'none';
      // Load the saved color if it exists
      chrome.storage.local.get(['savedColor'], function(result) {
        if (result.savedColor) {
          document.body.style.backgroundColor = result.savedColor;
        }
      });
    }
    else if (message.action === 'setDynamicBackground') {
      const match = window.location.href.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return;
      const [ , owner, repo ] = match;
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const hash = data[0].sha;
            const color = `#${hash.substring(0,6)}`;
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = color;
            chrome.storage.local.set({ savedColor: color });
            // Remove saved image when setting dynamic color
            chrome.storage.local.remove(['savedImage']);
          }
        })
        .catch(err => console.error('Erreur API GitHub :', err));
    }
});

