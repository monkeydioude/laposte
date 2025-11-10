export async function sendEmailMock(to: string, subject: string, text: string) {
  console.log(
    `[email] to=${to} | subject="${subject}" | text="${text.slice(0, 120)}"`
  );
}
