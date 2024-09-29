import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'documents'

        if (file.fieldname === 'profile') {
            folder = 'profiles'
        } else if (file.fieldname === 'product') {
            folder = 'products'
        }

        const dirPath = path.join(__dirname, '..', 'public', 'uploads', folder)
        cb(null, dirPath)
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`)
    }
})

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb(new Error('Error: Solo se permiten archivos JPEG, JPG, PNG o PDF!'))
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
})

export default upload
