const express = require('express');
const https = require('https'); // Importa el módulo HTTPS
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 5050;

// Configura CORS y JSON solo para las rutas necesarias
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Crear la carpeta 'documents' si no existe
const documentsPath = path.join(__dirname, 'documents');
if (!fs.existsSync(documentsPath)) {
    fs.mkdirSync(documentsPath);
}

// Configura la ruta para generar PDFs
app.post('/generate-pdf', async (req, res) => {
    const { htmlContent, fileName } = req.body;

    if (!htmlContent) {
        return res.status(400).send('HTML content is required');
    }

    const outputFilePath = path.join(documentsPath, fileName || 'generated_document.pdf');

    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        // Configura el contenido HTML en la página
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Agrega el CSS desde un archivo
        const cssFilePath = path.join(__dirname, 'styles.css');
        await page.addStyleTag({ path: cssFilePath });

        // Genera el PDF y guárdalo en el sistema de archivos
        await page.pdf({
            path: outputFilePath,
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        });

        await browser.close();

        // Leer el archivo PDF y codificarlo en base64
        const pdfData = fs.readFileSync(outputFilePath);
        const base64Pdf = pdfData.toString('base64');

        // Enviar el PDF codificado en base64 en la respuesta
        res.json({ message: `PDF successfully generated at ${outputFilePath}`, pdfBase64: base64Pdf });
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Error generating PDF");
    }
});

// Cargar los certificados SSL
const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/willsystemapp.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/willsystemapp.com/fullchain.pem'),
};

// Inicia el servidor HTTPS
https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`HTTPS server running on port ${PORT}`);
});
