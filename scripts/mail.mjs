import { Resend } from "resend";

const resend = new Resend("re_7nsaGUMW_KVKi5vMNmwXgFWxS7QftNfph");

resend.emails.send({
  from: "onboarding@resend.dev",
  to: "jb@lot23.com",
  subject: "🎸 EP email",
  html: "<p>This is an automated message from Enthusiastic Panther</p>",
});
