import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } from "docx";
import { ParsedResume } from "@/lib/types/resume";
import { DesignerSettings } from "@/lib/types/designer";
import { AnalysisData } from "@/components/resume/analysis/AnalysisDashboard";
import { jsonToPlainText } from "@/lib/utils/richTextHelpers";

// Helper to save Blob
const saveBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const PX_TO_TWIPS = 15;

const getDocxPageProperties = (settings?: DesignerSettings) => {
  if (!settings) {
    return {};
  }

  const marginPx = settings.margins ?? 40;
  const marginTwips = Math.max(0, Math.round(marginPx * PX_TO_TWIPS));
  const pageSize =
    settings.paperSize === "a4"
      ? { width: 11906, height: 16838 }
      : { width: 12240, height: 15840 };

  return {
    page: {
      size: pageSize,
      margin: {
        top: marginTwips,
        right: marginTwips,
        bottom: marginTwips,
        left: marginTwips,
      },
    },
  };
};

// --- Colors & Styles ---
const PURPLE = "6A47FF";
const DARK_GREY = "333333";
const LIGHT_GREY = "666666";
const WHITE = "FFFFFF";

// --- Resume Export ---
export const exportResumeToDocx = async (
  data: ParsedResume,
  title: string = "Resume",
  designerSettings?: DesignerSettings
) => {
  const sections: any[] = [];
  const RESUME_FONT = "Arial";

  // Header (Contact Info)
  if (data.contact) {
    const { name, email, phone, location, linkedin, portfolio } = data.contact;
    
    // Name
    if (name) {
      sections.push(
        new Paragraph({
          text: name.toUpperCase(),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          run: {
            color: DARK_GREY,
            size: 32, // 16pt
            bold: true,
            font: RESUME_FONT,
          }
        })
      );
    }

    // Contact Details Line
    const details = [email, phone, location, linkedin, portfolio].filter(Boolean).join(" | ");
    if (details) {
      sections.push(
        new Paragraph({
          text: details,
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          run: {
            color: LIGHT_GREY,
            size: 20, // 10pt
            font: RESUME_FONT,
          }
        })
      );
    }
  }

  // Target Title
  if (data.targetTitle) {
      sections.push(
          new Paragraph({
              text: data.targetTitle.toUpperCase(),
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
              spacing: { before: 100, after: 200 },
              run: {
                  color: PURPLE,
                  bold: true,
                  size: 24,
                  font: RESUME_FONT,
              }
          })
      );
  }

  // Helper for Section Headers
  const createSectionHeader = (title: string) => {
    return new Paragraph({
      text: title.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      thematicBreak: true, // Underline effect
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: "E0E0E0",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      run: {
        color: PURPLE,
        bold: true,
        size: 24, // 12pt
        font: RESUME_FONT,
      }
    });
  };

  // Summary
  if (data.summary) {
    sections.push(createSectionHeader("Professional Summary"));
    const summaryText = jsonToPlainText(data.summary);
    sections.push(
      new Paragraph({
        text: summaryText,
        spacing: { after: 120 },
        run: { font: RESUME_FONT, size: 22 }
      })
    );
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    sections.push(createSectionHeader("Experience"));
    data.experience.forEach(exp => {
      // Company & Date
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company,
              bold: true,
              size: 22, // 11pt
              font: RESUME_FONT,
            }),
            new TextRun({
              text: `\t${exp.location || ""}\t${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}`,
              bold: true,
              font: RESUME_FONT,
              size: 22,
            }),
          ],
          tabStops: [
            { type: TabStopType.CENTER, position: 4500 }, // Middle approximation
            { type: TabStopType.RIGHT, position: 9000 },  // Right align date
          ],
          spacing: { before: 120 },
        })
      );

      // Position
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.position,
              italics: true,
              font: RESUME_FONT,
              size: 22,
            })
          ],
          spacing: { after: 60 },
        })
      );

      // Bullets
      if (exp.bullets) {
        exp.bullets.forEach(bullet => {
          const bulletText = jsonToPlainText(bullet);
          sections.push(
            new Paragraph({
              text: bulletText,
              bullet: { level: 0 },
              run: { font: RESUME_FONT, size: 22 }
            })
          );
        });
      }
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    sections.push(createSectionHeader("Education"));
    data.education.forEach(edu => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.institution,
              bold: true,
              size: 22,
              font: RESUME_FONT,
            }),
            new TextRun({
              text: `\t${edu.graduationDate || ""}`,
              bold: true,
              font: RESUME_FONT,
              size: 22,
            }),
          ],
          tabStops: [
            { type: TabStopType.RIGHT, position: 9000 },
          ],
          spacing: { before: 120 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
                text: `${edu.degree}${edu.field ? ` in ${edu.field}` : ""}`,
                italics: true,
                font: RESUME_FONT,
                size: 22,
            })
          ]
        })
      );
    });
  }

  // Skills
  if (data.skills) {
    const hasSkills = data.skills.technical?.length || data.skills.soft?.length || data.skills.other?.length;
    if (hasSkills) {
      sections.push(createSectionHeader("Skills"));
      
      if (data.skills.technical?.length) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Technical: ", bold: true, font: RESUME_FONT, size: 22 }),
              new TextRun({ text: data.skills.technical.join(", "), font: RESUME_FONT, size: 22 }),
            ],
          })
        );
      }
      if (data.skills.soft?.length) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Soft Skills: ", bold: true, font: RESUME_FONT, size: 22 }),
              new TextRun({ text: data.skills.soft.join(", "), font: RESUME_FONT, size: 22 }),
            ],
          })
        );
      }
    }
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    sections.push(createSectionHeader("Projects"));
    data.projects.forEach(proj => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.name, bold: true, size: 22, font: RESUME_FONT }),
            new TextRun({ text: `\t${proj.link || ""}`, italics: true, font: RESUME_FONT, size: 22 }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
          spacing: { before: 120 },
        })
      );
      sections.push(new Paragraph({ text: proj.description, run: { font: RESUME_FONT, size: 22 } }));
      if (proj.technologies) {
        sections.push(new Paragraph({
            children: [
                new TextRun({
                    text: `Technologies: ${proj.technologies.join(", ")}`,
                    italics: true,
                    font: RESUME_FONT,
                    size: 22
                })
            ]
        }));
      }
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    sections.push(createSectionHeader("Certifications"));
    data.certifications.forEach(cert => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name, bold: true, font: RESUME_FONT, size: 22 }),
            new TextRun({ text: ` - ${cert.issuer || ""}`, font: RESUME_FONT, size: 22 }),
            new TextRun({ text: `\t${cert.date || ""}`, font: RESUME_FONT, size: 22 }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
        })
      );
    });
  }

  const doc = new Document({
    sections: [{
      properties: getDocxPageProperties(designerSettings),
      children: sections,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveBlob(blob, `${title}.docx`);
};

// --- Cover Letter Export ---
export const exportCoverLetterToDocx = async (content: string, jobTitle: string, company: string) => {
  const CL_FONT = "Times New Roman";

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header Block
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: "Cover Letter Application",
              size: 44, // 22pt
              bold: true,
              color: PURPLE,
              font: CL_FONT,
            }),
            new TextRun({
              text: `\nFor the position of: `,
              break: 1,
              size: 22, // 11pt
              bold: true,
              color: DARK_GREY,
              font: CL_FONT,
            }),
            new TextRun({
              text: jobTitle,
              size: 22,
              bold: true,
              color: PURPLE,
              font: CL_FONT,
            }),
            new TextRun({
              text: company ? `\nAt: ${company}` : "",
              break: 1,
              size: 22,
              color: LIGHT_GREY,
              font: CL_FONT,
            }),
             new TextRun({
              text: `\nDate: ${new Date().toLocaleDateString()}`,
              break: 1,
              size: 20, // 10pt
              color: LIGHT_GREY,
              font: CL_FONT,
            })
          ],
        }),
        
        // Divider
        new Paragraph({
            border: {
                bottom: { color: "E0E0E0", space: 1, style: BorderStyle.SINGLE, size: 6 }
            },
            spacing: { after: 300 }
        }),

        // Body Content
        ...content.split('\n').map(line => {
             const trimmed = line.trim();
             if (!trimmed) return new Paragraph({ text: "" });
             
             return new Paragraph({
                 children: [
                    new TextRun({
                        text: trimmed,
                        font: CL_FONT,
                        size: 22, // 11pt
                        color: "000000"
                    })
                 ],
                 spacing: { after: 200 },
                 alignment: AlignmentType.LEFT // DOCX full justify can be wonky
             });
        }),
        
        // Footer
        new Paragraph({
             text: "Generated by JobFoxy",
             alignment: AlignmentType.CENTER,
             spacing: { before: 600 },
             run: {
                 size: 16, // 8pt
                 color: "AAAAAA",
                 font: "Arial" // Sans-serif for footer to match PDF
             }
        })
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const safeTitle = jobTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
  saveBlob(blob, `CoverLetter_${safeTitle}.docx`);
};

// --- Analysis Report Export ---
export const exportAnalysisReportToDocx = async (data: AnalysisData, jobTitle: string, company: string) => {
  const sections: any[] = [];

  // 1. Report Header
  sections.push(
      new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
              new TextRun({ text: "JOB FIT ANALYSIS", bold: true, size: 36, color: PURPLE }),
          ]
      })
  );
  sections.push(
      new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
              new TextRun({ text: `${jobTitle}`, bold: true, size: 24, color: DARK_GREY }),
              new TextRun({ text: company ? ` at ${company}` : "", size: 24, color: LIGHT_GREY }),
              new TextRun({ text: `\nGenerated on ${new Date().toLocaleDateString()}`, break: 1, size: 18, color: "AAAAAA" })
          ]
      })
  );

  // 2. Score Cards (Table)
  const createScoreCell = (label: string, score: number) => {
      let color = "FF0000"; // Red
      if (score >= 70) color = "008000"; // Green
      else if (score >= 50) color = "FFA500"; // Orange

      return new TableCell({
          children: [
              new Paragraph({ 
                  text: `${score}%`, 
                  alignment: AlignmentType.CENTER,
                  heading: HeadingLevel.HEADING_1,
                  run: { color: color, bold: true, size: 60 }
              }),
              new Paragraph({ 
                  text: label, 
                  alignment: AlignmentType.CENTER,
                  run: { size: 20, color: LIGHT_GREY }
              })
          ],
          borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
          },
      });
  };

  const scoreTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({
              children: [
                  createScoreCell("ATS Score", data.ats_score),
                  createScoreCell("Job Match", data.jd_match_score || 0),
                  createScoreCell("Skills Fit", data.skills_fit_score || 0),
              ]
          })
      ],
  });

  sections.push(scoreTable);
  sections.push(new Paragraph({ text: "", spacing: { after: 400 } })); // Spacer

  // 3. Sections Helper
  const addAnalysisSection = (title: string, content: string | string[], icon: string = "•") => {
      if (!content || (Array.isArray(content) && content.length === 0)) return;

      // Section Header
      sections.push(
          new Paragraph({
              text: title.toUpperCase(),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 240, after: 120 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "E0E0E0" } },
              run: { color: PURPLE, bold: true, size: 24 }
          })
      );

      // Content
      if (Array.isArray(content)) {
          content.forEach(item => {
              sections.push(new Paragraph({ 
                  children: [
                      new TextRun({ text: `${icon}  `, bold: true, color: PURPLE }),
                      new TextRun({ text: item })
                  ],
                  spacing: { after: 100 }
              }));
          });
      } else {
          sections.push(new Paragraph({ 
              text: content,
              spacing: { after: 120 }
          }));
      }
  };

  // 4. Content Modules
  const coachingSummary = typeof data.coaching_summary === 'string' ? data.coaching_summary : data.coaching_summary?.insight;
  if (coachingSummary) {
    addAnalysisSection("Coaching Summary", coachingSummary);
  }
  
  if (data.ats_score_explanation) {
      addAnalysisSection("ATS Score Explanation", data.ats_score_explanation);
  }

  // Keywords Grid Strategy
  if ((data.matched_keywords && data.matched_keywords.length > 0) || (data.missing_keywords && data.missing_keywords.length > 0)) {
      sections.push(
          new Paragraph({
              text: "KEYWORD ANALYSIS",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 240, after: 120 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "E0E0E0" } },
              run: { color: PURPLE, bold: true, size: 24 }
          })
      );
      
      const matched = (data.matched_keywords || []).join(", ");
      const missing = (data.missing_keywords || []).join(", ");

      sections.push(new Paragraph({ 
          children: [
              new TextRun({ text: "Matched Keywords: ", bold: true, color: "008000" }),
              new TextRun(matched || "None")
          ],
          spacing: { after: 120 }
      }));

      sections.push(new Paragraph({ 
          children: [
              new TextRun({ text: "Missing Keywords: ", bold: true, color: "FF0000" }),
              new TextRun(missing || "None")
          ],
          spacing: { after: 120 }
      }));
  }
  
  // Bullet Improvements
  if (data.bullet_improvements && data.bullet_improvements.length > 0) {
      sections.push(
          new Paragraph({
              text: "IMPROVEMENT SUGGESTIONS",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 300, after: 120 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "E0E0E0" } },
              run: { color: PURPLE, bold: true, size: 24 }
          })
      );
      
      data.bullet_improvements.forEach((imp, i) => {
          sections.push(new Paragraph({
              children: [
                  new TextRun({
                      text: `Suggestion ${i+1}`,
                      bold: true,
                      size: 22,
                      color: DARK_GREY
                  })
              ],
              spacing: { before: 200, after: 60 }
          }));

          // Comparison Table
          const comparisonTable = new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                  new TableRow({
                      children: [
                          new TableCell({
                              children: [new Paragraph({ text: "BEFORE", run: { bold: true, color: "FF0000" } })],
                              width: { size: 10, type: WidthType.PERCENTAGE },
                              borders: { bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, top: { style: BorderStyle.NONE } }
                          }),
                          new TableCell({
                              children: [new Paragraph({ text: imp.before })],
                              borders: { bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, top: { style: BorderStyle.NONE } }
                          })
                      ]
                  }),
                  new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ text: "AFTER", run: { bold: true, color: "008000" } })],
                            width: { size: 10, type: WidthType.PERCENTAGE },
                            borders: { bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, top: { style: BorderStyle.NONE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: imp.after })],
                            borders: { bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, top: { style: BorderStyle.NONE } }
                        })
                    ]
                })
              ]
          });
          sections.push(comparisonTable);
          
          sections.push(new Paragraph({
              children: [
                  new TextRun({
                      text: ` Why: ${imp.reason}`,
                      italics: true,
                      color: LIGHT_GREY
                  })
              ],
              spacing: { after: 120, before: 60 },
              indent: { left: 720 } 
          }));
      });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: sections,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const safeTitle = jobTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
  saveBlob(blob, `Analysis_${safeTitle}.docx`);
};
