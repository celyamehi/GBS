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

    // Create a wrapper div to ensure proper capture
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      background: white;
      z-index: 9999;
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
      z-index: 1 !important;
    `

    // Force a reflow
    element.offsetHeight

    // Get the actual dimensions
    const rect = element.getBoundingClientRect()
    const scrollWidth = Math.max(element.scrollWidth, rect.width, 1200)
    const scrollHeight = Math.max(element.scrollHeight, rect.height)

    // Create canvas with enhanced settings
    const canvas = await html2canvas(element, {
      scale: 2,
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
      foreignObjectRendering: true,
      imageTimeout: 0,
      removeContainer: false,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId)
        if (clonedElement) {
          // Force all elements to be visible
          const allElements = clonedElement.querySelectorAll('*')
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement
            if (htmlEl.style) {
              htmlEl.style.display = htmlEl.style.display || ''
              htmlEl.style.visibility = htmlEl.style.visibility || 'visible'
              htmlEl.style.opacity = htmlEl.style.opacity || '1'
              htmlEl.style.color = htmlEl.style.color || 'inherit'
              htmlEl.style.backgroundColor = htmlEl.style.backgroundColor || 'transparent'
            }
          })

          // Specific table fixes
          clonedElement.style.width = '100% !important'
          clonedElement.style.maxWidth = '100% !important'
          clonedElement.style.overflow = 'visible !important'
          clonedElement.style.display = 'block !important'
          clonedElement.style.visibility = 'visible !important'

          // Fix table elements
          const tables = clonedElement.querySelectorAll('table')
          tables.forEach(table => {
            const htmlTable = table as HTMLElement
            htmlTable.style.width = '100% !important'
            htmlTable.style.maxWidth = '100% !important'
            htmlTable.style.tableLayout = 'fixed'
            htmlTable.style.borderCollapse = 'collapse'
          })

          // Fix table cells
          const cells = clonedElement.querySelectorAll('td, th')
          cells.forEach(cell => {
            const htmlCell = cell as HTMLElement
            htmlCell.style.display = 'table-cell !important'
            htmlCell.style.visibility = 'visible !important'
            htmlCell.style.whiteSpace = 'nowrap'
            htmlCell.style.padding = '8px'
            htmlCell.style.border = '1px solid #e5e7eb'
          })

          // Fix table rows
          const rows = clonedElement.querySelectorAll('tr')
          rows.forEach(row => {
            const htmlRow = row as HTMLElement
            htmlRow.style.display = 'table-row !important'
            htmlRow.style.visibility = 'visible !important'
          })
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
    const availableHeight = pdfHeight - 40
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
    loadingDiv.style.cssText = 'padding: 40px; text-align: center; color: #6b7280; font-size: 16px; background: white;'
    loadingDiv.innerHTML = 'Génération du PDF en cours...'
    element.innerHTML = ''
    element.appendChild(loadingDiv)

    // Wait a bit for the loading message to render
    await new Promise(resolve => setTimeout(resolve, 200))

    // Restore original content
    element.innerHTML = originalContent

    // Create a wrapper div to ensure proper capture
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
      z-index: 1 !important;
      display: block !important;
      visibility: visible !important;
    `

    // Force a reflow
    element.offsetHeight

    // Get the actual dimensions
    const rect = element.getBoundingClientRect()
    const scrollWidth = Math.max(element.scrollWidth, rect.width, 1200)
    const scrollHeight = Math.max(element.scrollHeight, rect.height)

    // Create canvas with enhanced settings
    const canvas = await html2canvas(element, {
      scale: 2,
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
      foreignObjectRendering: true,
      imageTimeout: 0,
      removeContainer: false,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(tableId)
        if (clonedElement) {
          // Force all elements to be visible
          const allElements = clonedElement.querySelectorAll('*')
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement
            if (htmlEl.style) {
              htmlEl.style.display = htmlEl.style.display || ''
              htmlEl.style.visibility = htmlEl.style.visibility || 'visible'
              htmlEl.style.opacity = htmlEl.style.opacity || '1'
              htmlEl.style.color = htmlEl.style.color || 'inherit'
              htmlEl.style.backgroundColor = htmlEl.style.backgroundColor || 'transparent'
            }
          })

          // Specific table fixes
          clonedElement.style.width = '100% !important'
          clonedElement.style.maxWidth = '100% !important'
          clonedElement.style.overflow = 'visible !important'
          clonedElement.style.display = 'block !important'
          clonedElement.style.visibility = 'visible !important'

          // Fix table elements
          const tables = clonedElement.querySelectorAll('table')
          tables.forEach(table => {
            const htmlTable = table as HTMLElement
            htmlTable.style.width = '100% !important'
            htmlTable.style.maxWidth = '100% !important'
            htmlTable.style.tableLayout = 'fixed'
            htmlTable.style.borderCollapse = 'collapse'
          })

          // Fix table cells
          const cells = clonedElement.querySelectorAll('td, th')
          cells.forEach(cell => {
            const htmlCell = cell as HTMLElement
            htmlCell.style.display = 'table-cell !important'
            htmlCell.style.visibility = 'visible !important'
            htmlCell.style.whiteSpace = 'nowrap'
            htmlCell.style.padding = '8px'
            htmlCell.style.border = '1px solid #e5e7eb'
            htmlCell.style.textAlign = htmlCell.style.textAlign || 'left'
          })

          // Fix table rows
          const rows = clonedElement.querySelectorAll('tr')
          rows.forEach(row => {
            const htmlRow = row as HTMLElement
            htmlRow.style.display = 'table-row !important'
            htmlRow.style.visibility = 'visible !important'
          })
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
    const availableHeight = pdfHeight - 50
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
