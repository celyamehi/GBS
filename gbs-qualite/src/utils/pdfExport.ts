import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const exportToPDF = async (elementId: string, filename: string, title: string): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId)
    if (!element) return false

    // Loading state
    const loadingDiv = document.createElement('div')
    loadingDiv.id = 'pdf-loading'
    loadingDiv.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center;
      align-items: center; z-index: 99999; color: white; font-size: 18px;
    `
    loadingDiv.innerHTML = 'Génération du PDF en cours...'
    document.body.appendChild(loadingDiv)

    // Wrapper
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%;
      background: white; z-index: 9999; padding: 20px; overflow-x: auto;
    `
    element.parentNode?.insertBefore(wrapper, element)
    wrapper.appendChild(element)

    // Store original styles
    const originalStyles = {
      position: element.style.position, top: element.style.top, left: element.style.left,
      width: element.style.width, height: element.style.height, overflow: element.style.overflow,
      transform: element.style.transform, opacity: element.style.opacity
    }

    // Apply optimal styles
    element.style.cssText = `
      position: relative !important; top: 0 !important; left: 0 !important;
      width: max-content !important; max-width: none !important; min-width: max-content !important;
      height: auto !important; overflow: visible !important; transform: none !important;
      opacity: 1 !important; background: white !important;
    `

    // Style all elements
    element.querySelectorAll('*').forEach(el => {
      const htmlEl = el as HTMLElement
      htmlEl.style.visibility = 'visible !important'
      htmlEl.style.opacity = '1 !important'
      
      if (htmlEl.tagName === 'TABLE') {
        htmlEl.style.cssText = `
          display: table !important; width: max-content !important;
          min-width: max-content !important; max-width: none !important;
          table-layout: auto !important; border-collapse: collapse !important;
          background: white !important; font-size: 10px !important;
        `
      }
      
      if (htmlEl.tagName === 'TD' || htmlEl.tagName === 'TH') {
        htmlEl.style.cssText = `
          display: table-cell !important; visibility: visible !important;
          white-space: nowrap !important; padding: 4px 6px !important;
          border: 1px solid #ddd !important; text-align: left !important;
          background: white !important; color: black !important;
          font-size: 9px !important; vertical-align: top !important;
        `
      }
    })

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Force scroll to ensure all content is visible
    element.scrollTop = 0
    element.scrollLeft = 0
    
    const actualWidth = Math.max(element.scrollWidth, element.offsetWidth)
    const actualHeight = Math.max(element.scrollHeight, element.offsetHeight)

    // PDF with landscape mode
    const pdf = new jsPDF({
      orientation: actualWidth > 1000 ? 'landscape' : 'portrait',
      unit: 'mm', format: 'a4'
    })

    // High quality capture with better dimensions
    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true, 
      allowTaint: true, 
      backgroundColor: '#ffffff',
      logging: false, 
      removeContainer: false, 
      foreignObjectRendering: false,
      imageTimeout: 30000, // Increased timeout
      width: actualWidth, 
      height: actualHeight,
      windowWidth: actualWidth, 
      windowHeight: actualHeight,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId)
        if (clonedElement) {
          clonedElement.style.width = 'max-content'
          clonedElement.style.minWidth = 'max-content'
          clonedElement.style.maxWidth = 'none'
          clonedElement.style.height = 'auto'
          clonedElement.style.overflow = 'visible'
          clonedElement.style.position = 'relative'
          
          // Apply styles to tables in clone
          const tables = clonedElement.querySelectorAll('table')
          tables.forEach(table => {
            const htmlTable = table as HTMLElement
            htmlTable.style.width = 'max-content'
            htmlTable.style.minWidth = 'max-content'
            htmlTable.style.maxWidth = 'none'
            htmlTable.style.tableLayout = 'auto'
            htmlTable.style.position = 'relative'
          })
          
          // Apply styles to table rows and cells
          const rows = clonedElement.querySelectorAll('tr')
          rows.forEach(row => {
            const htmlRow = row as HTMLElement
            htmlRow.style.display = 'table-row'
            htmlRow.style.visibility = 'visible'
            htmlRow.style.height = 'auto'
          })
          
          const cells = clonedElement.querySelectorAll('td, th')
          cells.forEach(cell => {
            const htmlCell = cell as HTMLElement
            htmlCell.style.display = 'table-cell'
            htmlCell.style.visibility = 'visible'
            htmlCell.style.whiteSpace = 'nowrap'
            htmlCell.style.padding = '4px 6px'
            htmlCell.style.border = '1px solid #ddd'
            htmlCell.style.textAlign = 'left'
            htmlCell.style.backgroundColor = 'white'
            htmlCell.style.color = 'black'
            htmlCell.style.fontSize = '9px'
            htmlCell.style.verticalAlign = 'top'
          })
        }
      }
    })

    // Restore styles
    Object.keys(originalStyles).forEach(key => {
      (element.style as any)[key] = originalStyles[key as keyof typeof originalStyles]
    })

    // Remove wrapper
    if (wrapper.parentNode) {
      wrapper.parentNode?.insertBefore(element, wrapper)
      wrapper.parentNode?.removeChild(wrapper)
    }

    // Calculate dimensions
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.9
    const scaledWidth = imgWidth * ratio
    const scaledHeight = imgHeight * ratio

    // Header
    pdf.setFontSize(16)
    pdf.text(title, pageWidth / 2, 15, { align: 'center' })
    pdf.setFontSize(10)
    pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 25, { align: 'center' })

    // Add image
    const imgData = canvas.toDataURL('image/png', 1.0)
    const imageY = 33

    if (scaledHeight + imageY <= pageHeight - 10) {
      pdf.addImage(imgData, 'PNG', (pageWidth - scaledWidth) / 2, imageY, scaledWidth, scaledHeight)
    } else {
      // Multi-page
      const availableHeight = pageHeight - imageY - 10
      const heightPerPage = imgHeight * (availableHeight / imgHeight)
      
      let yPosition = 0
      let pageNumber = 1
      
      while (yPosition < imgHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
          pdf.setFontSize(12)
          pdf.text(`${title} - Page ${pageNumber}`, pageWidth / 2, 15, { align: 'center' })
        }
        
        const sliceHeight = Math.min(heightPerPage, imgHeight - yPosition)
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = imgWidth
        tempCanvas.height = sliceHeight
        const tempCtx = tempCanvas.getContext('2d')
        
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, yPosition, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight)
          const sliceData = tempCanvas.toDataURL('image/png', 1.0)
          pdf.addImage(sliceData, 'PNG', (pageWidth - scaledWidth) / 2, pageNumber === 1 ? imageY : 25, scaledWidth, sliceHeight * ratio)
        }
        
        yPosition += heightPerPage
        pageNumber++
      }
    }

    pdf.save(filename)
    document.body.removeChild(loadingDiv)
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    const loadingDiv = document.getElementById('pdf-loading')
    if (loadingDiv) document.body.removeChild(loadingDiv)
    return false
  }
}

export const exportTableToPDF = async (tableId: string, filename: string, title: string, additionalInfo?: string): Promise<boolean> => {
  try {
    const element = document.getElementById(tableId)
    if (!element) return false

    // Loading state
    const loadingDiv = document.createElement('div')
    loadingDiv.id = 'pdf-loading'
    loadingDiv.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center;
      align-items: center; z-index: 99999; color: white; font-size: 18px;
    `
    loadingDiv.innerHTML = 'Génération du PDF en cours...'
    document.body.appendChild(loadingDiv)

    // Wrapper
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%;
      background: white; z-index: 9999; padding: 20px; overflow-x: auto;
    `
    element.parentNode?.insertBefore(wrapper, element)
    wrapper.appendChild(element)

    // Store original styles
    const originalStyles = {
      position: element.style.position, top: element.style.top, left: element.style.left,
      width: element.style.width, height: element.style.height, overflow: element.style.overflow,
      transform: element.style.transform, opacity: element.style.opacity
    }

    // Apply optimal styles
    element.style.cssText = `
      position: relative !important; top: 0 !important; left: 0 !important;
      width: max-content !important; max-width: none !important; min-width: max-content !important;
      height: auto !important; overflow: visible !important; transform: none !important;
      opacity: 1 !important; background: white !important;
    `

    // Style table elements
    element.querySelectorAll('*').forEach(el => {
      const htmlEl = el as HTMLElement
      htmlEl.style.visibility = 'visible !important'
      htmlEl.style.opacity = '1 !important'
      
      if (htmlEl.tagName === 'TABLE') {
        htmlEl.style.cssText = `
          display: table !important; width: max-content !important;
          min-width: max-content !important; max-width: none !important;
          table-layout: auto !important; border-collapse: collapse !important;
          background: white !important; font-size: 10px !important;
        `
      }
      
      if (htmlEl.tagName === 'TD' || htmlEl.tagName === 'TH') {
        htmlEl.style.cssText = `
          display: table-cell !important; visibility: visible !important;
          white-space: nowrap !important; padding: 4px 6px !important;
          border: 1px solid #ddd !important; text-align: left !important;
          background: white !important; color: black !important;
          font-size: 9px !important; vertical-align: top !important;
        `
      }
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    const actualWidth = element.scrollWidth
    const actualHeight = element.scrollHeight

    // PDF with landscape mode
    const pdf = new jsPDF({
      orientation: actualWidth > 1000 ? 'landscape' : 'portrait',
      unit: 'mm', format: 'a4'
    })

    // High quality capture
    const canvas = await html2canvas(element, {
      scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff',
      logging: false, removeContainer: false, foreignObjectRendering: false,
      imageTimeout: 20000, width: actualWidth, height: actualHeight,
      windowWidth: actualWidth, windowHeight: actualHeight
    })

    // Restore styles
    Object.keys(originalStyles).forEach(key => {
      (element.style as any)[key] = originalStyles[key as keyof typeof originalStyles]
    })

    // Remove wrapper
    if (wrapper.parentNode) {
      wrapper.parentNode?.insertBefore(element, wrapper)
      wrapper.parentNode?.removeChild(wrapper)
    }

    // Calculate dimensions
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.9
    const scaledWidth = imgWidth * ratio
    const scaledHeight = imgHeight * ratio

    // Header
    pdf.setFontSize(16)
    pdf.text(title, pageWidth / 2, 15, { align: 'center' })
    
    if (additionalInfo) {
      pdf.setFontSize(10)
      pdf.text(additionalInfo, pageWidth / 2, 25, { align: 'center' })
    }
    
    pdf.setFontSize(10)
    const date = new Date().toLocaleDateString('fr-FR')
    const dateY = additionalInfo ? 32 : 25
    pdf.text(`Généré le: ${date}`, pageWidth / 2, dateY, { align: 'center' })

    // Add image
    const imgData = canvas.toDataURL('image/png', 1.0)
    const imageY = additionalInfo ? 40 : 33

    if (scaledHeight + imageY <= pageHeight - 10) {
      pdf.addImage(imgData, 'PNG', (pageWidth - scaledWidth) / 2, imageY, scaledWidth, scaledHeight)
    } else {
      // Multi-page
      const availableHeight = pageHeight - imageY - 10
      const heightPerPage = imgHeight * (availableHeight / imgHeight)
      
      let yPosition = 0
      let pageNumber = 1
      
      while (yPosition < imgHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
          pdf.setFontSize(12)
          pdf.text(`${title} - Page ${pageNumber}`, pageWidth / 2, 15, { align: 'center' })
        }
        
        const sliceHeight = Math.min(heightPerPage, imgHeight - yPosition)
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = imgWidth
        tempCanvas.height = sliceHeight
        const tempCtx = tempCanvas.getContext('2d')
        
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, yPosition, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight)
          const sliceData = tempCanvas.toDataURL('image/png', 1.0)
          pdf.addImage(sliceData, 'PNG', (pageWidth - scaledWidth) / 2, pageNumber === 1 ? imageY : 25, scaledWidth, sliceHeight * ratio)
        }
        
        yPosition += heightPerPage
        pageNumber++
      }
    }

    pdf.save(filename)
    document.body.removeChild(loadingDiv)
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    const loadingDiv = document.getElementById('pdf-loading')
    if (loadingDiv) document.body.removeChild(loadingDiv)
    return false
  }
}
