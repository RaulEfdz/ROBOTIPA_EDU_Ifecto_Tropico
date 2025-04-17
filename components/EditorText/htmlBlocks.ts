export const getFileBlockHtml = (fileUrl: string, fileName: string) => {
    // Obtener la extensión del archivo
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Configurar colores y estilos según la extensión
    const fileConfig = getFileConfig(extension);
    
    return `
    <div class="file-block" style="margin: 12px 0; max-width: 560px; position: relative;">
      <div style="position: absolute; inset: -1px; border-radius: 10px; background: linear-gradient(to right, ${fileConfig.gradientFrom}, ${fileConfig.gradientTo}); opacity: 0.7; filter: blur(6px); transition: opacity 0.3s ease;"></div>
      <div style="position: absolute; inset: -1px; border-radius: 10px; background: linear-gradient(to right, ${fileConfig.gradientFrom}, ${fileConfig.gradientTo}); opacity: 0.6; filter: blur(3px); transition: opacity 0.3s ease;"></div>
      
      <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" style="position: relative; display: flex; align-items: center; gap: 12px; padding: 12px 16px; background-color: rgba(17, 25, 40, 0.95); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.125); text-decoration: none; transition: transform 0.2s ease;">
        <div style="display: flex; justify-content: center; align-items: center; width: 32px; height: 32px; background: linear-gradient(to bottom right, ${fileConfig.iconGradientFrom}, ${fileConfig.iconGradientTo}); border-radius: 8px; box-shadow: 0 2px 10px ${fileConfig.iconGradientFrom}80;">
          ${fileConfig.icon}
        </div>
        
        <div style="display: flex; flex-direction: column; flex-grow: 1; overflow: hidden;">
          <span style="font-weight: 500; color: white; font-size: 14px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${fileName}</span>
          <span style="font-size: 11px; color: ${fileConfig.subtextColor}; letter-spacing: 0.5px; text-transform: uppercase;">${fileConfig.fileType}</span>
        </div>
        
        <div style="display: flex; align-items: center; padding-left: 8px; margin-left: auto; transform: translateX(0); transition: transform 0.3s ease;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${fileConfig.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </div>
      </a>
      
      <div style="position: absolute; bottom: -2px; left: 50%; width: 85%; height: 1px; transform: translateX(-50%); background: linear-gradient(to right, transparent, ${fileConfig.gradientFrom}, transparent); opacity: 0.5; filter: blur(1px);"></div>
    </div>
    <script>
      (function() {
        const fileBlocks = document.querySelectorAll('.file-block');
        fileBlocks.forEach(block => {
          const link = block.querySelector('a');
          const glows = block.querySelectorAll('div[style*="position: absolute; inset:"]');
          const arrow = block.querySelector('div[style*="margin-left: auto"]');
          
          link.addEventListener('mouseenter', () => {
            glows.forEach(glow => {
              glow.style.opacity = '0.9';
            });
            arrow.style.transform = 'translateX(3px)';
          });
          
          link.addEventListener('mouseleave', () => {
            glows.forEach(glow => {
              glow.style.opacity = '0.7';
            });
            arrow.style.transform = 'translateX(0)';
          });
        });
      })();
    </script>
    `;
  };
  
  // Función para determinar la configuración del archivo según su extensión
  function getFileConfig(extension) {
    // Configuración para distintos tipos de archivos
    switch (extension.toLowerCase()) {
      case 'pdf':
        return {
          gradientFrom: '#ff4e50',
          gradientTo: '#f9d423',
          iconGradientFrom: '#ff4e50',
          iconGradientTo: '#f9d423',
          iconColor: '#ff4e50',
          subtextColor: '#ff7e7f',
          fileType: 'PDF Document',
          icon: `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M9 18v-6"></path>
              <path d="M12 18v-2"></path>
              <path d="M15 18v-4"></path>
            </svg>
          `
        };
      case 'doc':
      case 'docx':
        return {
          gradientFrom: '#2193b0',
          gradientTo: '#6dd5ed',
          iconGradientFrom: '#2193b0',
          iconGradientTo: '#6dd5ed',
          iconColor: '#2193b0',
          subtextColor: '#6dd5ed',
          fileType: 'Word Document',
          icon: `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
          `
        };
      case 'xls':
      case 'xlsx':
        return {
          gradientFrom: '#56ab2f',
          gradientTo: '#a8e063',
          iconGradientFrom: '#56ab2f',
          iconGradientTo: '#a8e063',
          iconColor: '#56ab2f',
          subtextColor: '#a8e063',
          fileType: 'Excel Spreadsheet',
          icon: `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
          `
        };
      case 'ppt':
      case 'pptx':
        return {
          gradientFrom: '#f46b45',
          gradientTo: '#eea849',
          iconGradientFrom: '#f46b45',
          iconGradientTo: '#eea849',
          iconColor: '#f46b45',
          subtextColor: '#f7a76c',
          fileType: 'PowerPoint Presentation',
          icon: `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          `
        };
      case 'txt':
        return {
          gradientFrom: '#6a11cb',
          gradientTo: '#2575fc',
          iconGradientFrom: '#6a11cb',
          iconGradientTo: '#2575fc',
          iconColor: '#6a11cb',
          subtextColor: '#a46dfd',
          fileType: 'Text Document',
          icon: `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="16" y1="9" x2="8" y2="9"></line>
            </svg>
          `
        };
      default:
        return {
          gradientFrom: '#4facfe',
          gradientTo: '#00f2fe',
          iconGradientFrom: '#4facfe',
          iconGradientTo: '#00f2fe',
          iconColor: '#4facfe',
          subtextColor: '#6ed4fd',
          fileType: 'Document',
          icon: `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          `
        };
    }
  }