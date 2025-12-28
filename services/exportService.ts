import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from "docx";
import FileSaver from "file-saver";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { GeneratedTest, Question } from "../types";

// --- DOCX Helpers ---

const createHeading = (text: string, level: number = 1) => {
    return new Paragraph({
        text: text,
        heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: 200, after: 100 },
        run: {
            bold: true,
            size: level === 1 ? 28 : 24,
        }
    });
};

const createText = (text: string, bold: boolean = false, italic: boolean = false) => {
    return new Paragraph({
        children: [new TextRun({ text, bold, italics: italic, size: 24 })], // 24 = 12pt
        spacing: { after: 100 }
    });
};

const createQuestion = (q: Question) => {
    const p = [
        new Paragraph({
            children: [
                new TextRun({ text: `Question ${q.id}: `, bold: true, size: 24 }),
                new TextRun({ text: q.questionText, size: 24 })
            ],
            spacing: { before: 100, after: 100 }
        })
    ];

    if (q.options && q.options.length > 0) {
        const opts = q.options.map((opt, i) => ` ${String.fromCharCode(65 + i)}. ${opt} `).join("    ");
        p.push(new Paragraph({
            children: [new TextRun({ text: opts, size: 24 })],
            spacing: { after: 200 }
        }));
    } else {
        p.push(new Paragraph({
            children: [new TextRun({ text: "   __________________________________________", size: 24 })],
            spacing: { after: 200 }
        }));
    }
    return p;
};

export const exportToDocx = async (data: GeneratedTest) => {
    const sections = [];

    // --- TEST PAPER SECTION ---
    sections.push(createHeading(data.testTitle || "GENERATED TEST", 1));

    // Part A
    sections.push(createHeading(data.partA.title, 2));
    sections.push(createText("TASK 1", true));
    data.partA.task1.questions.forEach(q => sections.push(...createQuestion(q)));
    sections.push(createText("TASK 2", true));
    data.partA.task2.questions.forEach(q => sections.push(...createQuestion(q)));

    // Part B
    sections.push(createHeading(data.partB.title, 2));
    sections.push(createText("I. Multiple Choice", true));
    data.partB.section1_mcq.forEach(q => sections.push(...createQuestion(q)));
    sections.push(createText("II. Error Identification", true));
    data.partB.section2_error.forEach(q => sections.push(...createQuestion(q)));
    sections.push(createText("III. Verb Forms", true));
    data.partB.section3_verbs.forEach(q => sections.push(...createQuestion(q)));

    // Part C
    sections.push(createHeading(data.partC.title, 2));
    sections.push(createText("I. Sign/Picture", true));
    sections.push(...createQuestion(data.partC.signQuestion));
    
    sections.push(createText("II. Cloze Test", true));
    sections.push(createText(data.partC.clozePassage.text, false, true)); // Italic passage
    data.partC.clozePassage.questions.forEach(q => sections.push(...createQuestion(q)));

    sections.push(createText("III. Reading Comprehension", true));
    sections.push(createText(data.partC.comprehensionPassage.text));
    data.partC.comprehensionPassage.questions.forEach(q => sections.push(...createQuestion(q)));

    // Part D
    sections.push(createHeading(data.partD.title, 2));
    sections.push(createText("I. Reordering", true));
    data.partD.reordering.forEach(q => sections.push(...createQuestion(q)));
    sections.push(createText("II. Rewriting", true));
    data.partD.rewriting.forEach(q => sections.push(...createQuestion(q)));
    sections.push(createText("III. Paragraph Writing", true));
    sections.push(createText(data.partD.paragraph.prompt, true));

    // --- ANSWER KEY SECTION ---
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(createHeading("ANSWER KEY", 1));

    const addKey = (title: string, questions: Question[]) => {
        const answers = questions.map(q => `Q${q.id}: ${q.correctAnswer}`).join(" | ");
        return [
            createText(title, true),
            createText(answers)
        ];
    };

    sections.push(createHeading("Part A: Listening", 2));
    sections.push(...addKey("Task 1", data.partA.task1.questions));
    sections.push(...addKey("Task 2", data.partA.task2.questions));

    sections.push(createHeading("Part B: Language Focus", 2));
    sections.push(...addKey("Multiple Choice", data.partB.section1_mcq));
    sections.push(...addKey("Error ID", data.partB.section2_error));
    sections.push(...addKey("Verbs", data.partB.section3_verbs));

    sections.push(createHeading("Part C: Reading", 2));
    sections.push(createText(`Sign: ${data.partC.signQuestion.correctAnswer}`));
    sections.push(...addKey("Cloze", data.partC.clozePassage.questions));
    sections.push(...addKey("Comprehension", data.partC.comprehensionPassage.questions));

    sections.push(createHeading("Part D: Writing", 2));
    sections.push(...addKey("Reordering", data.partD.reordering));
    sections.push(...addKey("Rewriting", data.partD.rewriting));
    sections.push(createText("Sample Paragraph:", true));
    sections.push(createText(data.partD.paragraph.sampleAnswer, false, true));

    // --- SCRIPTS SECTION ---
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(createHeading("LISTENING SCRIPTS", 1));
    sections.push(createHeading("Task 1", 2));
    sections.push(createText(data.partA.task1.script));
    sections.push(createHeading("Task 2", 2));
    sections.push(createText(data.partA.task2.script));

    // --- MATRIX SECTION ---
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(createHeading("MATRIX REPORT", 1));
    sections.push(createText(`Recognition: ${data.matrixReport.recognitionCount}`));
    sections.push(createText(`Comprehension: ${data.matrixReport.comprehensionCount}`));
    sections.push(createText(`Application: ${data.matrixReport.applicationCount}`));
    sections.push(createText(`Compliance Note: ${data.matrixReport.complianceNote}`));

    const doc = new Document({
        sections: [{
            properties: {},
            children: sections,
        }],
    });

    const blob = await Packer.toBlob(doc);
    // Handle FileSaver default export from ESM CDN
    const save = (FileSaver as any).saveAs || FileSaver;
    save(blob, "generated_test_full.docx");
};

export const exportToPdfDirect = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if(!element) return;
    
    // We use the modern .html() method of jsPDF which handles paging
    const pdf = new jsPDF('p', 'pt', 'a4');
    await pdf.html(element, {
        callback: function (doc) {
            doc.save(fileName);
        },
        x: 10,
        y: 10,
        width: 550, // A4 width is ~595pt. 
        windowWidth: 800, // Width of window for rendering
        autoPaging: 'text', // Try to not cut text in half
        html2canvas: {
            scale: 0.8, // Scale down a bit to fit
            letterRendering: true,
        }
    });
}
