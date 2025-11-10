export function buildWelcomeEmail(firstname: string, lastname: string, email: string) {
  const subject = `Welcome, ${firstname}!`;

  const text = [
    `Salut ${firstname} ${lastname}!`,
    `Ton email: ${email}`,
    `Bienvenue`,
  ].join('\n');

  const html = `
  <!doctype html>
  <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${subject}</title>
      <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif; background:#f6f7fb; margin:0; padding:32px; }
        .card { max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; box-shadow:0 2px 10px rgba(0,0,0,0.06); }
        .title { margin:0 0 12px; font-size:20px; }
        .muted { color:#667085; font-size:14px; }
        .btn { display:inline-block; padding:10px 16px; border-radius:10px; text-decoration:none; border:1px solid #e5e7eb; }
        .footer { text-align:center; color:#98a2b3; font-size:12px; margin-top:16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1 class="title">Salut ${firstname} ${lastname} !!!</h1>
        <p class="muted">Ton email: <strong>${email}</strong></p>
        <p>Bienvenue et merci de nous rejoindre. Nous sommes ravis de t'avoir à bord !</p>
        <p><a class="btn" href="#" target="_blank" rel="noopener">Ouvrir mon compte</a></p>
        <p class="footer">Si tu n'as pas créé de compte, ignore cet email.</p>
      </div>
    </body>
  </html>
  `.trim();

  return { subject, text, html };
}
