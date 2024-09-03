import dotenv from 'dotenv'
import transporter from '../config/emailConfig.js'

dotenv.config()

export const sendPurchaseEmail = async (user, purchasedProductsEmail, ticketCode, ticketAmount) => {
    const formattedDetails = purchasedProductsEmail.map(item => {
        return `Producto: ${item.product.name}\nDescripción: ${item.product.description}\nPrecio unitario: $${item.product.price}\nCantidad: ${item.quantity}\n\n`
    }).join('')

    const mailOptions = {
        from: process.env.EMAIL_USER_NODEMAILER,
        to: user.email,
        subject: 'Ticket de compra',
        text: `Hola ${user.first_name}!\n\nAquí está el número de ticket: ${ticketCode}:\n\n${formattedDetails}\nPrecio total: $${ticketAmount}\n\nEsperamos vuelvas`,
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log('Correo de compra enviado')
    } catch (error) {
        console.error('Error enviando el correo de compra:', error)
    }
}
