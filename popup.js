// Load saved background when popup opens
chrome.storage.local.get(['savedColor', 'savedImage', 'savedType'], function(result) {
    console.log('Popup loading saved background:', result);
    if (result.savedColor) {
        document.getElementById('colorPicker').value = result.savedColor;
    }
    if (result.savedImage) {
        document.getElementById('imagePreview').src = result.savedImage;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('removeImage').style.display = 'block';
    }
});

// Color picker
document.getElementById('colorPicker').addEventListener('change', function(e) {
    const color = e.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'setColor',
            color: color
        });
    });
});

// Dynamic background button
document.getElementById('dynamicButton').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'setDynamicBackground'
        });
    });
});

// Image upload
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    console.log('File selected:', file.name, file.type, file.size);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        console.log('File read complete, data length:', imageData.length);
        
        // Show preview
        const preview = document.getElementById('imagePreview');
        preview.src = imageData;
        preview.style.display = 'block';
        document.getElementById('removeImage').style.display = 'block';
        
        // Send to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'setImage',
                imageData: imageData
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    return;
                }
                console.log('Image sent to content script');
            });
        });
    };
    
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please try again.');
    };
    
    reader.readAsDataURL(file);
});

// Remove image
document.getElementById('removeImage').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'removeImage'
        });
    });
    
    // Update UI
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').src = '';
    document.getElementById('removeImage').style.display = 'none';
    document.getElementById('imageUpload').value = '';
});

