import{PDFDocument,PDFName,PDFDict,PDFRawStream}from'pdf-lib';
import{readFile,writeFile}from'node:fs/promises';
const file='public/tournament-score-sheet.pdf',pdf=await PDFDocument.load(await readFile(file));
pdf.setTitle('tanvir-ovi — The Full League score sheet');pdf.setAuthor('tanvir-ovi');pdf.setCreator('tanvir-ovi');pdf.setProducer('tanvir-ovi');pdf.setSubject('eFootball tournament fixtures and fillable score records');pdf.setKeywords(['tanvir-ovi','eFootball','tournament','score sheet']);
// The edited score sheet must not retain an invalid provenance attachment.
pdf.catalog.delete(PDFName.of('AF'));
const names=pdf.catalog.lookupMaybe(PDFName.of('Names'),PDFDict);names?.delete(PDFName.of('EmbeddedFiles'));
for(const[ref,object]of pdf.context.enumerateIndirectObjects())if(object instanceof PDFRawStream&&object.dict.get(PDFName.of('Subtype'))?.toString()==='/application#2Fc2pa')pdf.context.delete(ref);
await writeFile(file,await pdf.save({useObjectStreams:false}));
console.log(`Branded score sheet: ${pdf.getPageCount()} pages; ${pdf.getForm().getFields().length} fillable fields preserved.`);
