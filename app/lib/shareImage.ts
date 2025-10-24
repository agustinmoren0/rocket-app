// app/lib/shareImage.ts - Generar y compartir imágenes de progreso

export async function generateProgressImage(
  name: string,
  progress: number,
  activeDays: number,
  minutes: number,
  streak: number
): Promise<string> {
  // Crear canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // Fondo con gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#6366f1'); // indigo-600
  gradient.addColorStop(1, '#4f46e5'); // indigo-700
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Configuración de texto
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';

  // Título
  ctx.font = 'bold 80px sans-serif';
  ctx.fillText('🚀 Rocket', canvas.width / 2, 150);

  // Nombre
  ctx.font = '60px sans-serif';
  ctx.fillText(name, canvas.width / 2, 250);

  // Card blanco
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.roundRect(100, 320, canvas.width - 200, 550, 40);
  ctx.fill();

  // Textos en el card (color oscuro)
  ctx.fillStyle = '#1e293b';

  // Progreso principal
  ctx.font = 'bold 120px sans-serif';
  ctx.fillText(`${progress}%`, canvas.width / 2, 500);

  ctx.font = '40px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Progreso semanal', canvas.width / 2, 560);

  // Stats en 3 columnas
  const colWidth = (canvas.width - 200) / 3;
  const baseX = 100;
  const yPos = 700;

  // Días activos
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 70px sans-serif';
  ctx.fillText(`${activeDays}`, baseX + colWidth / 2, yPos);
  ctx.font = '35px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Días activos', baseX + colWidth / 2, yPos + 50);

  // Minutos
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 70px sans-serif';
  ctx.fillText(`${minutes}`, baseX + colWidth * 1.5, yPos);
  ctx.font = '35px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Minutos', baseX + colWidth * 1.5, yPos + 50);

  // Racha
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 70px sans-serif';
  ctx.fillText(`${streak}`, baseX + colWidth * 2.5, yPos);
  ctx.font = '35px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Racha', baseX + colWidth * 2.5, yPos + 50);

  // Footer
  ctx.fillStyle = '#ffffff';
  ctx.font = '35px sans-serif';
  ctx.fillText('Mi progreso creativo semanal', canvas.width / 2, 980);

  // Convertir a blob y crear URL
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob!);
      resolve(url);
    }, 'image/png');
  });
}

export async function shareProgress(imageUrl: string) {
  // Intentar usar Web Share API
  if (navigator.share) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'rocket-progress.png', { type: 'image/png' });

      await navigator.share({
        title: 'Mi progreso en Rocket',
        text: '¡Mirá mi progreso creativo de esta semana! 🚀',
        files: [file]
      });
    } catch (error) {
      // Si falla, descargar imagen
      downloadImage(imageUrl);
    }
  } else {
    // Fallback: descargar imagen
    downloadImage(imageUrl);
  }
}

function downloadImage(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rocket-progress.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
