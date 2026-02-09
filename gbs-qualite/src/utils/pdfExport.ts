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

    // Capture element with high-quality settings
    const canvas = await html2canvas(element, {
      scale: 4, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: false,
      foreignObjectRendering: false, // Disable for better Chrome compatibility
      imageTimeout: 20000, // Increased timeout for high quality
      width: element.scrollWidth * 4, // Higher resolution
      height: element.scrollHeight * 4, // Higher resolution
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure styles are applied in cloned document
        const clonedElement = clonedDoc.getElementById(elementId)
        if (clonedElement) {
          clonedElement.style.width = '100%'
          clonedElement.style.height = 'auto'
          clonedElement.style.overflow = 'visible'
          clonedElement.style.transform = 'scale(1)' // Ensure no scaling
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

    // Get image data with higher quality
    const imgData = canvas.toDataURL('image/png', 1.0) // Maximum quality
    
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
        
        const sliceData = tempCanvas.toDataURL('image/png', 1.0)
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

    // Force all table elements to be visible
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
        htmlEl.style.backgroundColor = 'white !important'
      }
      
      // Special handling for table rows and cells
      if (htmlEl.tagName === 'TR') {
        htmlEl.style.display = 'table-row !important'
        htmlEl.style.visibility = 'visible !important'
        htmlEl.style.backgroundColor = 'white !important'
      }
      
      if (htmlEl.tagName === 'TD' || htmlEl.tagName === 'TH') {
        htmlEl.style.display = 'table-cell !important'
        htmlEl.style.visibility = 'visible !important'
        htmlEl.style.whiteSpace = 'nowrap !important'
        htmlEl.style.padding = '8px !important'
        htmlEl.style.border = '1px solid #ddd !important'
        htmlEl.style.textAlign = 'left !important'
        htmlEl.style.backgroundColor = 'white !important'
        htmlEl.style.color = 'black !important'
      }
    })

    // Wait a bit for styles to apply
    await new Promise(resolve => setTimeout(resolve, 500))

    // Capture element with high-quality settings
    const canvas = await html2canvas(element, {
      scale: 4, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: false,
      foreignObjectRendering: false, // Disable for better Chrome compatibility
      imageTimeout: 20000, // Increased timeout for high quality
      width: element.scrollWidth * 4, // Higher resolution
      height: element.scrollHeight * 4, // Higher resolution
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure styles are applied in cloned document
        const clonedElement = clonedDoc.getElementById(tableId)
        if (clonedElement) {
          clonedElement.style.width = '100%'
          clonedElement.style.height = 'auto'
          clonedElement.style.overflow = 'visible'
          clonedElement.style.transform = 'scale(1)' // Ensure no scaling
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

    // Get image data with higher quality
    const imgData = canvas.toDataURL('image/png', 1.0) // Maximum quality
    
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
    const headerHeight = additionalInfo ? 35 : 30
    
    while (yPosition < pdfHeight) {
      if (yPosition > 0) {
        pdf.addPage()
      }
      
      // Add header
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text(title, pageWidth / 2, 15, { align: 'center' })
      
      // Add additional info if provided
      if (additionalInfo) {
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(additionalInfo, pageWidth / 2, 25, { align: 'center' })
      }
      
      // Add date
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      const date = new Date().toLocaleDateString('fr-FR')
      pdf.text(`Généré le: ${date}`, pageWidth / 2, additionalInfo ? 32 : 25, { align: 'center' })
      
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
        
        const sliceData = tempCanvas.toDataURL('image/png', 1.0)
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
