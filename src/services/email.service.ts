import db from "../libs/knex";
import { TABLES } from "../enums/tables";
import * as nodemailer from "nodemailer";
import { env } from "../libs/dotenv";
import type Mail from "nodemailer/lib/mailer";
import { generateVerificationCodeEmailHtml } from "../utils/emails";
import { generateVerificationCode } from "../utils/code-validation";
import { z } from "zod";
import { CustomZodError } from "../utils/custom-zod-error";
import { DatabaseError } from "../utils/database-error";

export class EmailService {
  private transporter: nodemailer.Transporter;

  private sendEmailBodySchema = z.object({
    email: z.string().email(),
  });

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: env.EMAIL_SENDER_USER,
        pass: env.EMAIL_SENDER_PASSWORD,
      },
    });
  }

  async sendVerificationCode(requestBody: unknown) {
    let body: z.infer<typeof this.sendEmailBodySchema>;

    try {
      body = this.sendEmailBodySchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new CustomZodError(error);
      }
      throw error;
    }

    const code = generateVerificationCode();

    try {
      const user = await db(TABLES.USERS).where({ email: body.email }).first();

      if (!user) {
        throw new Error("User not found");
      }

      await db(TABLES.VERIFICATION_CODES).insert({
        code,
        user_id: user.id,
        expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      });
    } catch (error) {
      if ("code" in error) {
        throw new DatabaseError(error);
      }
      throw error;
    }

    const sendEmailOptions: Mail.Options = {
      to: body.email,
      subject: "Daily Diet - Verification Code",
      html: generateVerificationCodeEmailHtml(code),
    };

    await this.transporter.sendMail(sendEmailOptions);
  }
}
