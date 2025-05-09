// Function to set background with proper styling
function setBackground(type, value) {
    // Reset all background properties
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = 'transparent';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.transition = 'all 0.3s ease';

    switch(type) {
        case 'color':
            document.body.style.backgroundColor = value;
            break;
        case 'image':
            document.body.style.backgroundImage = `url(${value})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.opacity = '0.8'; // Slightly transparent for better readability
            break;
        case 'dynamic':
            // Create gradient animation
            document.body.style.background = 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)';
            document.body.style.backgroundSize = '400% 400%';
            document.body.style.animation = 'gradient 15s ease infinite';
            document.body.style.opacity = '0.9';
            break;
    }
}

// Add gradient animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
`;
document.head.appendChild(style);

// Load saved background when page loads
chrome.storage.local.get(['savedColor', 'savedImage', 'savedType'], function(result) {
    console.log('Content script loading saved background:', result);
    if (result.savedType === 'dynamic') {
        setBackground('dynamic');
    } else if (result.savedImage) {
        console.log('Attempting to load saved image');
        try {
            setBackground('image', result.savedImage);
            console.log('Background image set successfully');
        } catch (error) {
            console.error('Error setting background image:', error);
            chrome.storage.local.remove(['savedImage', 'savedType']);
        }
    } else if (result.savedColor) {
        console.log('Loading saved color:', result.savedColor);
        setBackground('color', result.savedColor);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message.action);
    
    if (message.action === 'setColor') {
        setBackground('color', message.color);
        // Save the color to storage
        chrome.storage.local.set({ 
            savedColor: message.color,
            savedType: 'color'
        });
        // Remove saved image when setting color
        chrome.storage.local.remove(['savedImage']);
    }
    else if (message.action === 'setImage') {
        console.log('Setting new image, data length:', message.imageData.length);
        try {
            setBackground('image', message.imageData);
            console.log('New background image set successfully');
            
            // Save the image to storage after confirming it works
            chrome.storage.local.set({ 
                savedImage: message.imageData,
                savedType: 'image'
            }, function() {
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
            chrome.storage.local.remove(['savedImage', 'savedType']);
        }
    }
    else if (message.action === 'removeImage') {
        console.log('Removing image from content script');
        setBackground('color', '#ffffff'); // Reset to white
        // Load the saved color if it exists
        chrome.storage.local.get(['savedColor'], function(result) {
            if (result.savedColor) {
                setBackground('color', result.savedColor);
            }
        });
    }
    else if (message.action === 'setDynamicBackground') {
        setBackground('dynamic');
        chrome.storage.local.set({ savedType: 'dynamic' });
        chrome.storage.local.remove(['savedColor', 'savedImage']);
    }
});

