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
      position: relative;
    `

    // Ensure the element is fully visible and scrollable
    const originalOverflow = element.style.overflow
    const originalHeight = element.style.height
    element.style.overflow = 'visible'
    element.style.height = 'auto'
    
    // Force a reflow to ensure all content is rendered
    element.offsetHeight
    
    // Get the actual dimensions including all content
    const rect = element.getBoundingClientRect()
    const scrollWidth = Math.max(element.scrollWidth, rect.width, 1200)
    const scrollHeight = Math.max(element.scrollHeight, rect.height)
    
    // Create canvas from element with better settings
    const canvas = await html2canvas(element, {
      scale: 1.8,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: scrollWidth,
      height: scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: scrollWidth,
      windowHeight: scrollHeight,
      x: 0,
      y: 0,
      onclone: (clonedDoc) => {
        // Fix gradients and colors in cloned document
        const clonedElement = clonedDoc.getElementById(elementId)
        if (clonedElement) {
          // Ensure all text is visible and properly styled
          const textElements = clonedElement.querySelectorAll('*')
          textElements.forEach(el => {
            const htmlEl = el as HTMLElement
            if (htmlEl.style) {
              htmlEl.style.color = htmlEl.style.color || 'inherit'
              htmlEl.style.backgroundColor = htmlEl.style.backgroundColor || 'transparent'
              htmlEl.style.opacity = htmlEl.style.opacity || '1'
            }
          })
          
          // Force full width for better capture
          clonedElement.style.width = '100%'
          clonedElement.style.maxWidth = '100%'
          clonedElement.style.overflow = 'visible'
        }
      }
    })

    // Restore original styles
    element.style.cssText = originalStyle
    element.style.overflow = originalOverflow
    element.style.height = originalHeight

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
        
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Généré le: ${date}`, pdfWidth / 2, 22, { align: 'center' })
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
    await new Promise(resolve => setTimeout(resolve, 200))

    // Restore original content
    element.innerHTML = originalContent

    // Ensure the table container is fully visible and scrollable
    const originalOverflow = element.style.overflow
    const originalHeight = element.style.height
    element.style.overflow = 'visible'
    element.style.height = 'auto'
    
    // Force a reflow to ensure all content is rendered
    element.offsetHeight
    
    // Get the actual dimensions including all content
    const rect = element.getBoundingClientRect()
    const scrollWidth = Math.max(element.scrollWidth, rect.width, 1200)
    const scrollHeight = Math.max(element.scrollHeight, rect.height)
    
    // Temporarily modify styles for better PDF rendering
    const originalStyle = element.style.cssText
    element.style.cssText = `
      ${originalStyle}
      transform: scale(1);
      transform-origin: top left;
      width: 100%;
      max-width: 100%;
      overflow: visible;
      position: relative;
    `

    // Create canvas from element with better settings
    const canvas = await html2canvas(element, {
      scale: 1.8,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: scrollWidth,
      height: scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: scrollWidth,
      windowHeight: scrollHeight,
      x: 0,
      y: 0,
      onclone: (clonedDoc) => {
        // Fix styles in cloned document
        const clonedElement = clonedDoc.getElementById(tableId)
        if (clonedElement) {
          // Ensure all text is visible and properly styled
          const textElements = clonedElement.querySelectorAll('*')
          textElements.forEach(el => {
            const htmlEl = el as HTMLElement
            if (htmlEl.style) {
              htmlEl.style.color = htmlEl.style.color || 'inherit'
              htmlEl.style.backgroundColor = htmlEl.style.backgroundColor || 'transparent'
              htmlEl.style.opacity = htmlEl.style.opacity || '1'
            }
          })
          
          // Force full width for better capture
          clonedElement.style.width = '100%'
          clonedElement.style.maxWidth = '100%'
          clonedElement.style.overflow = 'visible'
          
          // Ensure table rows are visible
          const tableRows = clonedElement.querySelectorAll('tr, tbody, thead')
          tableRows.forEach(row => {
            const htmlRow = row as HTMLElement
            htmlRow.style.display = 'table-row'
            htmlRow.style.visibility = 'visible'
          })
          
          // Ensure table cells are visible
          const tableCells = clonedElement.querySelectorAll('td, th')
          tableCells.forEach(cell => {
            const htmlCell = cell as HTMLElement
            htmlCell.style.display = 'table-cell'
            htmlCell.style.visibility = 'visible'
            htmlCell.style.whiteSpace = 'nowrap'
          })
        }
      }
    })

    // Restore original styles
    element.style.cssText = originalStyle
    element.style.overflow = originalOverflow
    element.style.height = originalHeight

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
    const availableHeight = pdfHeight - 50 // Leave space for header
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
    
    // Calculate how many pages we need
    const totalPages = Math.ceil(finalHeight / availableHeight)
    
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage()
        // Add header to each page
        pdf.setFontSize(16)
        pdf.setTextColor(40, 40, 40)
        pdf.text(title, pdfWidth / 2, 15, { align: 'center' })
        
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Généré le: ${date}`, pdfWidth / 2, 22, { align: 'center' })
        
        if (additionalInfo) {
          pdf.setFontSize(9)
          pdf.setTextColor(80, 80, 80)
          pdf.text(additionalInfo, pdfWidth / 2, 27, { align: 'center' })
        }
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
        pdf.addImage(pageImgData, 'PNG', margin, 35, finalWidth, pageHeight)
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
