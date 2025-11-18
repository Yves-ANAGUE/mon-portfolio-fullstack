import PDFDocument from 'pdfkit';
import axios from 'axios';

export const generatePortfolioPDF = async (portfolioData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header avec logo si disponible
      doc.fontSize(28).fillColor('#4F46E5').text(portfolioData.name || 'Portfolio', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('#666').text(portfolioData.title || 'Développeur Full Stack', { align: 'center' });
      doc.moveDown();
      
      // Contact info
      if (portfolioData.contact) {
        doc.fontSize(10).fillColor('#333');
        const contact = portfolioData.contact;
        const contactLine = [contact.email, contact.phone, contact.location].filter(Boolean).join(' | ');
        doc.text(contactLine, { align: 'center' });
      }
      
      doc.moveDown(2);

      // About Section
      if (portfolioData.about) {
        addSection(doc, 'À PROPOS', portfolioData.about);
      }

      // Skills Section
      if (portfolioData.skills && portfolioData.skills.length > 0) {
        doc.addPage();
        doc.fontSize(18).fillColor('#4F46E5').text('COMPÉTENCES', { underline: true });
        doc.moveDown();
        
        portfolioData.skills.forEach(skill => {
          doc.fontSize(12).fillColor('#333').text(`• ${skill.name}`, { continued: true });
          if (skill.level) {
            doc.fillColor('#666').text(` - ${skill.level}%`);
          } else {
            doc.text('');
          }
        });
      }

      // Projects Section
      if (portfolioData.projects && portfolioData.projects.length > 0) {
        doc.addPage();
        doc.fontSize(18).fillColor('#4F46E5').text('PROJETS', { underline: true });
        doc.moveDown();
        
        portfolioData.projects.forEach((project, index) => {
          if (index > 0) doc.moveDown();
          
          doc.fontSize(14).fillColor('#333').text(project.title, { bold: true });
          doc.fontSize(10).fillColor('#666').text(project.date || '');
          doc.moveDown(0.5);
          
          if (project.description) {
            doc.fontSize(11).fillColor('#444').text(project.description);
          }
          
          if (project.technologies && project.technologies.length > 0) {
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#4F46E5').text('Technologies: ' + project.technologies.join(', '));
          }
          
          if (project.url) {
            doc.fillColor('#4F46E5').text('Lien: ' + project.url, { link: project.url });
          }
          
          doc.moveDown();
        });
      }

      // Testimonials Section
      if (portfolioData.testimonials && portfolioData.testimonials.length > 0) {
        doc.addPage();
        doc.fontSize(18).fillColor('#4F46E5').text('TÉMOIGNAGES', { underline: true });
        doc.moveDown();
        
        portfolioData.testimonials.forEach((testimonial, index) => {
          if (index > 0) doc.moveDown(1.5);
          
          doc.fontSize(11).fillColor('#444').text(`"${testimonial.message}"`);
          doc.moveDown(0.5);
          doc.fontSize(10).fillColor('#666').text(`- ${testimonial.name}${testimonial.position ? ', ' + testimonial.position : ''}`);
        });
      }

      // Footer sur chaque page
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#999').text(
          `Page ${i + 1} / ${pages.count}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

function addSection(doc, title, content) {
  doc.fontSize(18).fillColor('#4F46E5').text(title, { underline: true });
  doc.moveDown();
  doc.fontSize(11).fillColor('#333').text(content, { align: 'justify' });
  doc.moveDown(2);
}

export const downloadCV = async (cvUrl) => {
  try {
    const response = await axios.get(cvUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Erreur téléchargement CV:', error);
    throw error;
  }
};
