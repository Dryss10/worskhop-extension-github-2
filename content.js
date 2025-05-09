// Load saved background when page loads
chrome.storage.local.get(['savedColor', 'savedImage'], function(result) {
  console.log('Content script loading saved background:', result);
  if (result.savedImage) {
    console.log('Attempting to load saved image');
    try {
      document.body.style.backgroundImage = `url(${result.savedImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      console.log('Background image set successfully');
    } catch (error) {
      console.error('Error setting background image:', error);
      chrome.storage.local.remove(['savedImage']);
    }
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
      try {
        document.body.style.backgroundImage = `url(${message.imageData})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        console.log('New background image set successfully');
        
        // Save the image to storage after confirming it works
        chrome.storage.local.set({ savedImage: message.imageData }, function() {
          if (chrome.runtime.lastError) {
            console.error('Error saving image to storage:', chrome.runtime.lastError);
          } else {
            console.log('Image saved to storage successfully');
          }
        });
        
        // Remove saved color when setting image
        chrome.storage.local.remove(['savedColor']);
      } catch (error) {
        console.error('Error setting new background image:', error);
        chrome.storage.local.remove(['savedImage']);
      }
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

