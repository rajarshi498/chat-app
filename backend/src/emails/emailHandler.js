import { Resend } from "resend";
import { sender, resendClient } from "../lib/resend.js";

export const sendWelcomeEmail = async (email, name,clientURL) => {
    const {data,error} = await resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject:"Welcome to Chat-app",
        html: createWelcomeEmailTemplate(name,clientURL),
    });
    if(error){
        console.error("Error sending welcome email:", error);
        throw new Error("Failed to send welcome email");
    }
    console.log("Welcome email sent:", data);W3
};