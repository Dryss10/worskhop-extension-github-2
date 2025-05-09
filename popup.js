// Load saved background when popup opens
chrome.storage.local.get(['savedColor', 'savedImage'], function(result) {
  if (result.savedColor) {
    document.getElementById('colorPicker').value = result.savedColor;
  }
  if (result.savedImage) {
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.src = result.savedImage;
    imagePreview.style.display = 'block';
    document.getElementById('removeImage').style.display = 'block';
  }
});

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

document.getElementById('imageUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.src = imageData;
            imagePreview.style.display = 'block';
            document.getElementById('removeImage').style.display = 'block';
            
            // Save and apply the image
            chrome.storage.local.set({ savedImage: imageData }, function() {
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    chrome.tabs.sendMessage(tabs[0].id, { 
                        action: 'setImage', 
                        imageData: imageData 
                    });
                });
            });
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('removeImage').addEventListener('click', () => {
    // Remove the image
    chrome.storage.local.remove(['savedImage']);
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('removeImage').style.display = 'none';
    document.getElementById('imageUpload').value = '';
    
    // Notify content script to remove the image
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'removeImage' });
    });
});

