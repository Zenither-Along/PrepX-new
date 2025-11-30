const fetch = require('node-fetch');
(async () => {
  const body = {
    messages: [{ role: 'user', content: 'Improve this table' }],
    columnId: 'col1',
    context: {},
    webSearch: false,
    jsonMode: false,
    teachingMode: false,
    editingSection: { type: 'table', content: { data: [['A','B'],['C','D']] } }
  };
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error('Error:', e);
  }
})();
