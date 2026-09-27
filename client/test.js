// POST Request
const postResponse = await fetch('http://127.0.0.1:8787/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ username: "wowdabug", password: "b9ad27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9" }),
});
const postData = await postResponse.json();
console.log(postData);
