// Load saved background when page loads
chrome.storage.local.get(['savedColor', 'savedImage'], function(result) {
  if (result.savedImage) {
    const img = new Image();
    img.onload = function() {
      document.body.style.backgroundImage = `url(${result.savedImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    };
    img.src = result.savedImage;
  } else if (result.savedColor) {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = result.savedColor;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'setColor') {
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = message.color;
      // Save the color to storage
      chrome.storage.local.set({ savedColor: message.color });
      // Remove saved image when setting color
      chrome.storage.local.remove(['savedImage']);
    }
    else if (message.action === 'setImage') {
      const img = new Image();
      img.onload = function() {
        document.body.style.backgroundImage = `url(${message.imageData})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        // Save the image to storage
        chrome.storage.local.set({ savedImage: message.imageData });
        // Remove saved color when setting image
        chrome.storage.local.remove(['savedColor']);
      };
      img.src = message.imageData;
    }
    else if (message.action === 'removeImage') {
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

