chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'setColor') {
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = message.color;
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
          }
        })
        .catch(err => console.error('Erreur API GitHub :', err));
    }
});

