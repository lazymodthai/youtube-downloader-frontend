import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import type { SummaryResponse } from '../types';

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs} ชั่วโมง ${mins} นาที ${secs} วินาที`;
  }
  return `${mins} นาที ${secs} วินาที`;
};

export const exportSummaryToDocx = async (summary: SummaryResponse): Promise<void> => {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '📺 สรุปเนื้อหาวิดีโอ',
          bold: true,
          size: 48,
          color: 'E91E63',
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Divider line
  children.push(
    new Paragraph({
      border: {
        bottom: {
          color: 'CCCCCC',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { after: 300 },
    })
  );

  // Video Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: summary.title,
          bold: true,
          size: 40,
          color: '333333',
        }),
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
    })
  );

  // Info Section
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '👤 ผู้สร้าง: ',
          bold: true,
          size: 28,
          color: '666666',
        }),
        new TextRun({
          text: summary.author,
          size: 28,
          color: '333333',
        }),
        new TextRun({
          text: '     |     ',
          size: 28,
          color: 'CCCCCC',
        }),
        new TextRun({
          text: '⏱️ ความยาว: ',
          bold: true,
          size: 28,
          color: '666666',
        }),
        new TextRun({
          text: formatDuration(summary.duration),
          size: 28,
          color: '333333',
        }),
        new TextRun({
          text: '     |     ',
          size: 28,
          color: 'CCCCCC',
        }),
        new TextRun({
          text: summary.transcriptSource === 'subtitle' ? '📝 จาก Subtitle' : '🎙️ จาก Audio',
          size: 28,
          color: '666666',
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // Market Highlights Section
  if (summary.marketHighlights && summary.marketHighlights.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '📊 Market Highlights',
            bold: true,
            size: 36,
            color: '1976D2',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 },
      })
    );

    summary.marketHighlights.forEach((highlight, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${highlight.title}`,
              bold: true,
              size: 32,
              color: '333333',
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: highlight.description,
              size: 28,
              color: '666666',
            }),
          ],
          spacing: { after: 200 },
          indent: { left: 300 },
        })
      );
    });
  }

  // Papers / Research Section
  if (summary.papers && summary.papers.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '📑 งานวิจัย / รายงาน',
            bold: true,
            size: 36,
            color: '9C27B0',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    );

    summary.papers.forEach((paper) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${paper.source}] `,
              bold: true,
              size: 28,
              color: '9C27B0',
            }),
            new TextRun({
              text: paper.title,
              bold: true,
              size: 32,
              color: '333333',
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );

      paper.keyFindings.forEach((finding) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '• ',
                size: 28,
                color: '4CAF50',
              }),
              new TextRun({
                text: finding,
                size: 28,
                color: '666666',
              }),
            ],
            spacing: { after: 80 },
            indent: { left: 300 },
          })
        );
      });
    });
  }

  // Conclusion Section
  if (summary.conclusion) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '✅ สรุป',
            bold: true,
            size: 36,
            color: '388E3C',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: summary.conclusion,
            size: 32,
            color: '333333',
          }),
        ],
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );
  }

  // Footer
  children.push(
    new Paragraph({
      border: {
        top: {
          color: 'CCCCCC',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { before: 400, after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `📊 ความยาว Transcript: ${summary.transcriptLength.toLocaleString()} ตัวอักษร`,
          size: 24,
          color: '999999',
          italics: true,
        }),
      ],
      alignment: AlignmentType.RIGHT,
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `สร้างโดย YouTube Downloader - ${new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
          size: 24,
          color: '999999',
          italics: true,
        }),
      ],
      alignment: AlignmentType.RIGHT,
    })
  );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'TH Sarabun New',
            size: 32,
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const sanitizedTitle = summary.title.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 100);
  saveAs(blob, `${sanitizedTitle}-summary.docx`);
};
