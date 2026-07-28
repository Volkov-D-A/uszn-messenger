"use strict";

const fs = require("node:fs");
const path = require("node:path");

const slideNames = [
  "01-title.png",
  "02-solution.png",
  "03-capabilities.png",
  "04-workspace.png",
  "05-results.png",
  "06-attention.png",
  "07-files-search.png",
  "08-design.png",
  "09-results.png",
];

const destination = process.argv[2] || path.join(__dirname, "..", "sistema-kommunikacii-uszn.pdf");
const pageWidth = 960;
const pageHeight = 540;

function readPng(filePath) {
  const png = fs.readFileSync(filePath);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  if (!png.subarray(0, 8).equals(signature)) {
    throw new Error(`Not a PNG file: ${filePath}`);
  }

  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const imageData = [];

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      imageData.push(data);
    } else if (type === "IEND") {
      break;
    }

    offset += length + 12;
  }

  if (bitDepth !== 8 || colorType !== 2 || interlace !== 0) {
    throw new Error(`Expected a non-interlaced 8-bit RGB PNG: ${filePath}`);
  }

  return { width, height, data: Buffer.concat(imageData) };
}

function pdfObject(number, body) {
  const content = Buffer.isBuffer(body) ? body : Buffer.from(body, "binary");
  return Buffer.concat([
    Buffer.from(`${number} 0 obj\n`, "ascii"),
    content,
    Buffer.from("\nendobj\n", "ascii"),
  ]);
}

function streamObject(number, dictionary, stream) {
  return pdfObject(number, Buffer.concat([
    Buffer.from(`<< ${dictionary} /Length ${stream.length} >>\nstream\n`, "ascii"),
    stream,
    Buffer.from("\nendstream", "ascii"),
  ]));
}

const slides = slideNames.map((name) => readPng(path.join(__dirname, name)));
const objects = [];
const pageNumbers = slides.map((_, index) => 3 + index * 3);

objects.push(pdfObject(1, "<< /Type /Catalog /Pages 2 0 R >>"));
objects.push(pdfObject(2, `<< /Type /Pages /Count ${slides.length} /Kids [${pageNumbers.map((number) => `${number} 0 R`).join(" ")}] >>`));

slides.forEach((slide, index) => {
  const pageNumber = pageNumbers[index];
  const imageNumber = pageNumber + 1;
  const contentNumber = pageNumber + 2;
  const drawing = Buffer.from(`q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`, "ascii");

  objects.push(pdfObject(pageNumber,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
    `/Resources << /XObject << /Im0 ${imageNumber} 0 R >> >> /Contents ${contentNumber} 0 R >>`));
  objects.push(streamObject(imageNumber,
    `/Type /XObject /Subtype /Image /Width ${slide.width} /Height ${slide.height} ` +
    `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode ` +
    `/DecodeParms << /Predictor 15 /Colors 3 /BitsPerComponent 8 /Columns ${slide.width} >>`,
    slide.data));
  objects.push(streamObject(contentNumber, "", drawing));
});

const header = Buffer.from("%PDF-1.4\n%\xff\xff\xff\xff\n", "binary");
const offsets = [0];
let position = header.length;

for (const object of objects) {
  offsets.push(position);
  position += object.length;
}

const xrefOffset = position;
const xrefRows = offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
const xref = Buffer.from(
  `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${xrefRows}` +
  `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
  "ascii",
);

fs.writeFileSync(path.resolve(destination), Buffer.concat([header, ...objects, xref]));
console.log(`Built ${slides.length} slides: ${destination}`);
