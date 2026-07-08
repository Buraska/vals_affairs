export type AdvertisingEvent = {
  title: string
  date: string
  price: string
  image: string
  description: string
  url: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function generateAdvertisingHtml(events: AdvertisingEvent[]): string {
  return `<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Events</title>

<style>
  /* HEADER */
.header {
    background: linear-gradient(135deg,#7a1f14 0%,#a83418 50%,#c05a10 100%);
    padding: 40px;
    color: #f5f5f5;
}

.header-inner {
    max-width: 900px;
    margin: 0 auto;
}

.header-title {
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-size: 22px;
    font-weight: bold;
}

.header-sub {
    font-size: 14px;
    opacity: 0.9;
}

  
body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #f4f4f4;
    color: #222;
}

.container {
    max-width: 900px;
    margin: 30px auto;
    padding: 0 20px;
}

h2 {
    color: #a83418;
    margin-bottom: 5px;
}

.date {
    color: #666;
    margin-bottom: 10px;
}

.img-card {
    width: 100%;
    height: 280px;
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    margin: 10px 0 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.img-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.price {
    padding: 5px 8px;
    font-size: 12px;
    display: inline-block;
}
a { color:#a83418; font-weight:bold; text-decoration:none; }

</style>

</head>
<body>

<div class="header">
    <div class="header-inner">
        <div class="header-title">Waltz &amp; Vals Voyage Capital</div>
        <div class="header-sub">Путешествия и отдых</div>
    </div>
</div>

<div class="container">

<p>Приглашаем вас в путешествия или просто приятно провести вечер.</p>

${events
  .map(
    (event) => `
<h2>${escapeHtml(event.title)}</h2>

<div class="date">${escapeHtml(event.date)}</div>

<div class="price">${escapeHtml(event.price)}</div>

<div class="img-card">
    <img src="${escapeHtml(event.image)}" alt="${escapeHtml(event.title)}">
</div>

<p class="description">${escapeHtml(event.description)}</p>

<a href="${escapeHtml(event.url)}">Подробнее →</a>
`,
  )
  .join('\n')}

</div>

</body>
</html>`
}
