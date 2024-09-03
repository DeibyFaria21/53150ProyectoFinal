import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER_NODEMAILER,
        pass: process.env.EMAIL_PASS_NODEMAILER,
    },
})

export default transporter