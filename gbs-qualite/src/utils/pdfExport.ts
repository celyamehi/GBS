import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const exportToPDF = async (elementId: string, filename: string, title: string) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error('Element not found:', elementId)
      return
    }

    // Show loading state
    const originalContent = element.innerHTML
    element.innerHTML = '<div style="padding: 40px; text-align: center; color: #6b7280; font-size: 16px;">Génération du PDF en cours...</div>'

    // Wait a bit for the loading message to render
    await new Promise(resolve => setTimeout(resolve, 200))

    // Restore original content
    element.innerHTML = originalContent

    // Temporarily modify styles for better PDF rendering
    const originalStyle = element.style.cssText
    element.style.cssText = `
      ${originalStyle}
      transform: scale(1);
      transform-origin: top left;
      width: 100%;
      max-width: 100%;
      overflow: visible;
    `

    // Create canvas from element with better settings
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Fix gradients and colors in the cloned document
        const clonedElement = clonedDoc.getElementById(elementId)
        if (clonedElement) {
          // Ensure all text is visible
          const textElements = clonedElement.querySelectorAll('*')
          textElements.forEach(el => {
            const htmlEl = el as HTMLElement
            if (htmlEl.style) {
              htmlEl.style.color = htmlEl.style.color || 'inherit'
            }
          })
        }
      }
    })

    // Restore original styles
    element.style.cssText = originalStyle

    // Get image data
    const imgData = canvas.toDataURL('image/png', 0.95)
    
    // Calculate dimensions
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    
    // Calculate image dimensions to fit page
    const availableWidth = pdfWidth - 2 * margin
    const availableHeight = pdfHeight - 40 // Leave space for header
    const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight)
    const finalWidth = imgWidth * ratio
    const finalHeight = imgHeight * ratio
    
    // Add header
    pdf.setFontSize(16)
    pdf.setTextColor(40, 40, 40)
    pdf.text(title, pdfWidth / 2, 15, { align: 'center' })
    
    // Add date
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    const date = new Date().toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    pdf.text(`Généré le: ${date}`, pdfWidth / 2, 22, { align: 'center' })
    
    // Calculate how many pages we need
    const totalPages = Math.ceil(finalHeight / availableHeight)
    
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage()
        // Add header to each page
        pdf.setFontSize(16)
        pdf.setTextColor(40, 40, 40)
        pdf.text(title, pdfWidth / 2, 15, { align: 'center' })
      }
      
      const startY = i * availableHeight
      const remainingHeight = finalHeight - startY
      const pageHeight = Math.min(remainingHeight, availableHeight)
      
      // Calculate source rectangle for this page
      const sourceY = (startY / ratio)
      const sourceHeight = (pageHeight / ratio)
      
      // Create a temporary canvas for this page
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = imgWidth
      pageCanvas.height = sourceHeight
      const pageCtx = pageCanvas.getContext('2d')
      
      if (pageCtx) {
        pageCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight)
        const pageImgData = pageCanvas.toDataURL('image/png', 0.95)
        pdf.addImage(pageImgData, 'PNG', margin, 30, finalWidth, pageHeight)
      }
    }

    // Save the PDF
    pdf.save(filename)
    
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    return false
  }
}

export const exportTableToPDF = async (tableId: string, filename: string, title: string, additionalInfo?: string) => {
  try {
    const element = document.getElementById(tableId)
    if (!element) {
      console.error('Table element not found:', tableId)
      return
    }

    // Show loading state
    const originalContent = element.innerHTML
    const loadingDiv = document.createElement('div')
    loadingDiv.style.cssText = 'padding: 40px; text-align: center; color: #6b7280; font-size: 16px;'
    loadingDiv.innerHTML = 'Génération du PDF en cours...'
    element.innerHTML = ''
    element.appendChild(loadingDiv)

    // Wait a bit for the loading message to render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Restore original content
    element.innerHTML = originalContent

    // Create canvas from element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    })

    // Get image data
    const imgData = canvas.toDataURL('image/png')
    
    // Calculate dimensions
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    
    // Calculate image dimensions to fit page
    const availableWidth = pdfWidth - 2 * margin
    const availableHeight = pdfHeight - 40 // Leave space for header
    const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight)
    const finalWidth = imgWidth * ratio
    const finalHeight = imgHeight * ratio
    
    // Add header
    pdf.setFontSize(16)
    pdf.setTextColor(40, 40, 40)
    pdf.text(title, pdfWidth / 2, 15, { align: 'center' })
    
    // Add date
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    const date = new Date().toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    pdf.text(`Généré le: ${date}`, pdfWidth / 2, 22, { align: 'center' })
    
    // Add additional info if provided
    if (additionalInfo) {
      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      pdf.text(additionalInfo, pdfWidth / 2, 27, { align: 'center' })
    }
    
    // Add image
    pdf.addImage(imgData, 'PNG', margin, 30, finalWidth, finalHeight)
    
    // Save the PDF
    pdf.save(filename)
    
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    return false
  }
}
