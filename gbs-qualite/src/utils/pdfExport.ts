import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const exportToPDF = async (elementId: string, filename: string, title: string): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Element with id "${elementId}" not found`)
      return false
    }

    // Show loading state
    const loadingDiv = document.createElement('div')
    loadingDiv.id = 'pdf-loading'
    loadingDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      color: white;
      font-size: 18px;
      font-family: Arial, sans-serif;
    `
    loadingDiv.innerHTML = 'Génération du PDF en cours...'
    document.body.appendChild(loadingDiv)

    // Create a wrapper to control element during capture
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      background: white;
      z-index: 9999;
      padding: 20px;
      box-sizing: border-box;
    `
    element.parentNode?.insertBefore(wrapper, element)
    wrapper.appendChild(element)

    // Force the element to be fully visible
    const originalPosition = element.style.position
    const originalTop = element.style.top
    const originalLeft = element.style.left
    const originalWidth = element.style.width
    const originalHeight = element.style.height
    const originalOverflow = element.style.overflow
    const originalTransform = element.style.transform
    const originalOpacity = element.style.opacity

    element.style.cssText = `
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      overflow: visible !important;
      transform: none !important;
      opacity: 1 !important;
      background: white !important;
    `

    // Force all child elements to be visible
    const allElements = element.querySelectorAll('*')
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement
      htmlEl.style.visibility = 'visible !important'
      htmlEl.style.opacity = '1 !important'
      htmlEl.style.display = 'block !important'
      
      // Special handling for tables
      if (htmlEl.tagName === 'TABLE') {
        htmlEl.style.display = 'table !important'
        htmlEl.style.width = '100% !important'
        htmlEl.style.tableLayout = 'fixed !important'
        htmlEl.style.borderCollapse = 'collapse !important'
      }
      
      // Special handling for table rows and cells
      if (htmlEl.tagName === 'TR') {
        htmlEl.style.display = 'table-row !important'
        htmlEl.style.visibility = 'visible !important'
      }
      
      if (htmlEl.tagName === 'TD' || htmlEl.tagName === 'TH') {
        htmlEl.style.display = 'table-cell !important'
        htmlEl.style.visibility = 'visible !important'
        htmlEl.style.whiteSpace = 'nowrap !important'
        htmlEl.style.padding = '8px !important'
        htmlEl.style.border = '1px solid #ddd !important'
        htmlEl.style.textAlign = 'left !important'
      }
    })

    // Wait a bit for styles to apply
    await new Promise(resolve => setTimeout(resolve, 500))

    // Capture the element with Chrome-compatible settings
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: false,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId)
        if (clonedElement) {
          clonedElement.style.width = '100%'
          clonedElement.style.height = 'auto'
          clonedElement.style.overflow = 'visible'
        }
      }
    })

    // Restore original styles
    element.style.position = originalPosition
    element.style.top = originalTop
    element.style.left = originalLeft
    element.style.width = originalWidth
    element.style.height = originalHeight
    element.style.overflow = originalOverflow
    element.style.transform = originalTransform
    element.style.opacity = originalOpacity

    // Remove wrapper
    if (wrapper.parentNode) {
      wrapper.parentNode?.insertBefore(element, wrapper)
      wrapper.parentNode?.removeChild(wrapper)
    }

    // Get image data
    const imgData = canvas.toDataURL('image/png', 0.95)
    
    // Calculate PDF dimensions
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const pageHeight = 297 // A4 height in mm
    const pageWidth = 210 // A4 width in mm
    const ratio = imgWidth / pageWidth
    const pdfHeight = imgHeight / ratio

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    let yPosition = 0
    const headerHeight = 20
    
    while (yPosition < pdfHeight) {
      if (yPosition > 0) {
        pdf.addPage()
      }
      
      // Add header
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text(title, pageWidth / 2, 15, { align: 'center' })
      
      // Add date
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      const date = new Date().toLocaleDateString('fr-FR')
      pdf.text(`Généré le: ${date}`, pageWidth / 2, 25, { align: 'center' })
      
      // Calculate slice dimensions
      const sliceHeight = Math.min((pageHeight - headerHeight) * ratio, imgHeight - yPosition)
      const sliceY = yPosition
      const sliceWidth = imgWidth
      const sliceX = 0
      
      // Create a temporary canvas for this slice
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = sliceWidth
      tempCanvas.height = sliceHeight
      const tempCtx = tempCanvas.getContext('2d')
      
      if (tempCtx) {
        tempCtx.drawImage(
          canvas,
          sliceX, sliceY, sliceWidth, sliceHeight,
          0, 0, sliceWidth, sliceHeight
        )
        
        const sliceData = tempCanvas.toDataURL('image/png', 0.95)
        pdf.addImage(sliceData, 'PNG', 10, headerHeight, pageWidth - 20, (pageHeight - headerHeight))
      }
      
      yPosition += sliceHeight
    }

    // Save PDF
    pdf.save(filename)
    
    // Remove loading
    document.body.removeChild(loadingDiv)
    
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    
    // Remove loading if it exists
    const loadingDiv = document.getElementById('pdf-loading')
    if (loadingDiv) {
      document.body.removeChild(loadingDiv)
    }
    
    return false
  }
}

export const exportTableToPDF = async (tableId: string, filename: string, title: string, additionalInfo?: string): Promise<boolean> => {
  try {
    const element = document.getElementById(tableId)
    if (!element) {
      console.error(`Element with id "${tableId}" not found`)
      return false
    }

    // Show loading state
    const loadingDiv = document.createElement('div')
    loadingDiv.id = 'pdf-loading'
    loadingDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      color: white;
      font-size: 18px;
      font-family: Arial, sans-serif;
    `
    loadingDiv.innerHTML = 'Génération du PDF en cours...'
    document.body.appendChild(loadingDiv)

    // Create a wrapper with landscape orientation support
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      background: white;
      z-index: 9999;
      padding: 20px;
      box-sizing: border-box;
      overflow-x: auto;
    `
    element.parentNode?.insertBefore(wrapper, element)
    wrapper.appendChild(element)

    // Force the element to be fully visible with natural width
    const originalPosition = element.style.position
    const originalTop = element.style.top
    const originalLeft = element.style.left
    const originalWidth = element.style.width
    const originalHeight = element.style.height
    const originalOverflow = element.style.overflow
    const originalTransform = element.style.transform
    const originalOpacity = element.style.opacity

    element.style.cssText = `
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      width: max-content !important;
      max-width: none !important;
      min-width: max-content !important;
      height: auto !important;
      overflow: visible !important;
      transform: none !important;
      opacity: 1 !important;
      background: white !important;
    `

    // Force all table elements to be visible with optimal styling
    const allElements = element.querySelectorAll('*')
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement
      htmlEl.style.visibility = 'visible !important'
      htmlEl.style.opacity = '1 !important'
      
      // Special handling for tables
      if (htmlEl.tagName === 'TABLE') {
        htmlEl.style.display = 'table !important'
        htmlEl.style.width = 'max-content !important'
        htmlEl.style.minWidth = 'max-content !important'
        htmlEl.style.maxWidth = 'none !important'
        htmlEl.style.tableLayout = 'auto !important'
        htmlEl.style.borderCollapse = 'collapse !important'
        htmlEl.style.backgroundColor = 'white !important'
        htmlEl.style.fontSize = '10px !important'
        htmlEl.style.fontFamily = 'Arial, sans-serif !important'
      }
      
      // Special handling for table rows
      if (htmlEl.tagName === 'TR') {
        htmlEl.style.display = 'table-row !important'
        htmlEl.style.visibility = 'visible !important'
        htmlEl.style.backgroundColor = 'white !important'
        htmlEl.style.height = 'auto !important'
      }
      
      // Special handling for table cells
      if (htmlEl.tagName === 'TD' || htmlEl.tagName === 'TH') {
        htmlEl.style.display = 'table-cell !important'
        htmlEl.style.visibility = 'visible !important'
        htmlEl.style.whiteSpace = 'nowrap !important'
        htmlEl.style.padding = '4px 6px !important'
        htmlEl.style.border = '1px solid #ddd !important'
        htmlEl.style.textAlign = 'left !important'
        htmlEl.style.backgroundColor = 'white !important'
        htmlEl.style.color = 'black !important'
        htmlEl.style.fontSize = '9px !important'
        htmlEl.style.fontFamily = 'Arial, sans-serif !important'
        htmlEl.style.verticalAlign = 'top !important'
      }
    })

    // Wait a bit for styles to apply
    await new Promise(resolve => setTimeout(resolve, 500))

    // Get the actual dimensions after styling
    const actualWidth = element.scrollWidth
    const actualHeight = element.scrollHeight

    // Create PDF in landscape mode for better table fit
    const pdf = new jsPDF({
      orientation: actualWidth > 1000 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Capture the element with high quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: false,
      foreignObjectRendering: false,
      imageTimeout: 20000,
      width: actualWidth,
      height: actualHeight,
      windowWidth: actualWidth,
      windowHeight: actualHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(tableId)
        if (clonedElement) {
          clonedElement.style.width = 'max-content'
          clonedElement.style.minWidth = 'max-content'
          clonedElement.style.maxWidth = 'none'
          
          const table = clonedElement.querySelector('table')
          if (table) {
            const htmlTable = table as HTMLElement
            htmlTable.style.width = 'max-content'
            htmlTable.style.minWidth = 'max-content'
            htmlTable.style.maxWidth = 'none'
            htmlTable.style.tableLayout = 'auto'
          }
        }
      }
    })

    // Restore original styles
    element.style.position = originalPosition
    element.style.top = originalTop
    element.style.left = originalLeft
    element.style.width = originalWidth
    element.style.height = originalHeight
    element.style.overflow = originalOverflow
    element.style.transform = originalTransform
    element.style.opacity = originalOpacity

    // Remove wrapper
    if (wrapper.parentNode) {
      wrapper.parentNode?.insertBefore(element, wrapper)
      wrapper.parentNode?.removeChild(wrapper)
    }

    // Calculate PDF dimensions
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    
    // Get PDF page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Calculate ratio to fit image in page
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.9 // 90% of page size
    const scaledWidth = imgWidth * ratio
    const scaledHeight = imgHeight * ratio

    // Add header
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text(title, pageWidth / 2, 15, { align: 'center' })
    
    if (additionalInfo) {
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(additionalInfo, pageWidth / 2, 25, { align: 'center' })
    }
    
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    const date = new Date().toLocaleDateString('fr-FR')
    const dateY = additionalInfo ? 32 : 25
    pdf.text(`Généré le: ${date}`, pageWidth / 2, dateY, { align: 'center' })

    // Add table image
    const imgData = canvas.toDataURL('image/png', 1.0)
    const imageY = additionalInfo ? 40 : 33
    
    // Check if image fits on one page
    if (scaledHeight + imageY <= pageHeight - 10) {
      // Fits on one page
      pdf.addImage(imgData, 'PNG', (pageWidth - scaledWidth) / 2, imageY, scaledWidth, scaledHeight)
    } else {
      // Needs multiple pages
      const availableHeight = pageHeight - imageY - 10
      const ratioPerPage = availableHeight / imgHeight
      const heightPerPage = imgHeight * ratioPerPage
      
      let yPosition = 0
      let pageNumber = 1
      
      while (yPosition < imgHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
          pdf.setFontSize(12)
          pdf.text(`${title} - Page ${pageNumber}`, pageWidth / 2, 15, { align: 'center' })
        }
        
        const sliceHeight = Math.min(heightPerPage, imgHeight - yPosition)
        
        // Create a temporary canvas for this slice
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = imgWidth
        tempCanvas.height = sliceHeight
        const tempCtx = tempCanvas.getContext('2d')
        
        if (tempCtx) {
          tempCtx.drawImage(
            canvas,
            0, yPosition, imgWidth, sliceHeight,
            0, 0, imgWidth, sliceHeight
          )
          
          const sliceData = tempCanvas.toDataURL('image/png', 1.0)
          const sliceScaledHeight = sliceHeight * ratio
          pdf.addImage(sliceData, 'PNG', (pageWidth - scaledWidth) / 2, pageNumber === 1 ? imageY : 25, scaledWidth, sliceScaledHeight)
        }
        
        yPosition += heightPerPage
        pageNumber++
      }
    }

    // Save PDF
    pdf.save(filename)
    
    // Remove loading
    document.body.removeChild(loadingDiv)
    
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    
    // Remove loading if it exists
    const loadingDiv = document.getElementById('pdf-loading')
    if (loadingDiv) {
      document.body.removeChild(loadingDiv)
    }
    
    return false
  }
}
