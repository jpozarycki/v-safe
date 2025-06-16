async function getCurrentDomain() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  return url.hostname;
}

async function loadPasswords() {
  const domain = await getCurrentDomain();
  document.getElementById('domain').textContent = `Domain: ${domain}`;

  try {
    const res = await fetch(`http://localhost:8080/password?domain=${domain}`);
    const json = await res.json();

    const ul = document.getElementById('passwords');
    ul.innerHTML = '';

    json.data.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p.password;
      ul.appendChild(li);
    });
  } catch (err) {
    document.getElementById('domain').textContent = '❌ Failed to load passwords.';
    console.error(err);
  }
}

loadPasswords();
