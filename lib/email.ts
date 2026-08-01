import { Resend } from "resend";

export async function notifyAdminNewRequest(shopName: string, message: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const admin = process.env.ADMIN_EMAIL;
  if (!key || !admin) return; // sin config, no bloquea la solicitud
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    await new Resend(key).emails.send({
      from: "Sólo A Mano <onboarding@resend.dev>",
      to: admin,
      subject: `Nueva solicitud de sello: ${shopName}`,
      html: `<p><strong>${shopName}</strong> postuló al sello Sólo A Mano.</p>
             ${message ? `<p>Mensaje: "${message}"</p>` : ""}
             <p><a href="${site}/admin">Revisar en el panel de admin</a></p>`,
    });
  } catch {
    // el correo es best-effort; la solicitud ya quedó guardada
  }
}
