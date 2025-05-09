// Load saved background when popup opens
chrome.storage.local.get(['savedColor', 'savedImage'], function(result) {
  console.log('Loading saved background:', result);
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
        console.log('File selected:', file.name, file.type, file.size);
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            console.error('File too large');
            alert('File is too large. Please select an image under 5MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            console.log('File read complete, data length:', event.target.result.length);
            const imageData = event.target.result;
            
            // Verify the data is a valid image
            if (!imageData.startsWith('data:image/')) {
                console.error('Invalid image data');
                alert('Invalid image format. Please select a valid image file.');
                return;
            }
            
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.src = imageData;
            imagePreview.style.display = 'block';
            document.getElementById('removeImage').style.display = 'block';
            
            // Save and apply the image
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                console.log('Sending image to content script');
                chrome.tabs.sendMessage(tabs[0].id, { 
                    action: 'setImage', 
                    imageData: imageData 
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('Message error:', chrome.runtime.lastError);
                    } else {
                        console.log('Image sent successfully');
                        // Only save to storage after confirming the image was set
                        chrome.storage.local.set({ savedImage: imageData }, function() {
                            if (chrome.runtime.lastError) {
                                console.error('Storage error:', chrome.runtime.lastError);
                            } else {
                                console.log('Image saved to storage');
                            }
                        });
                    }
                });
            });
        };
        reader.onerror = function(error) {
            console.error('FileReader error:', error);
            alert('Error reading the image file. Please try again.');
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('removeImage').addEventListener('click', () => {
    console.log('Removing image');
    // Remove the image
    chrome.storage.local.remove(['savedImage'], function() {
        console.log('Image removed from storage');
        if (chrome.runtime.lastError) {
            console.error('Storage removal error:', chrome.runtime.lastError);
        }
    });
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('removeImage').style.display = 'none';
    document.getElementById('imageUpload').value = '';
    
    // Notify content script to remove the image
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'removeImage' });
    });
});

