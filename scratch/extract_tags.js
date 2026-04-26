const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve(__dirname, '../../plantilla/Generación de FPP 1 - 4_  Plantilla valores.docx'), 'binary');
const zip = new PizZip(content);
const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

const text = doc.getFullText();
console.log(text);
