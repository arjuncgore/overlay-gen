// Add event listeners for all inputs
document.addEventListener('DOMContentLoaded', function () {
  // Get all input elements
  const inputs = document.querySelectorAll('input');
  inputs.forEach((input) => {
    if (input.type === 'color') {
      // For color inputs, we want immediate updates
      input.addEventListener('input', function (e) {
        generateImage();
      });
    } else if (input.type === 'range') {
      // For sliders, update the number input and generate image
      input.addEventListener('input', function (e) {
        const numberInput = document.getElementById(e.target.id + 'Number');
        if (numberInput) {
          numberInput.value = e.target.value;
          updateSliderBackground(e.target);
        }
        generateImage();
      });
    } else if (input.type === 'number' && input.id.endsWith('Number')) {
      // For number inputs paired with sliders
      input.addEventListener('input', function (e) {
        const sliderId = e.target.id.replace('Number', '');
        const slider = document.getElementById(sliderId);
        if (slider) {
          let value = parseInt(e.target.value);
          // Clamp value to min/max
          value = Math.min(Math.max(value, slider.min), slider.max);
          e.target.value = value;
          slider.value = value;
          updateSliderBackground(slider);
        }
        generateImage();
      });
    } else {
      // For other inputs
      input.addEventListener('input', handleTextInput);
    }
  });

  // Initialize slider backgrounds
  document
    .querySelectorAll('input[type="range"]')
    .forEach(updateSliderBackground);

  // Add event listeners for selects
  document
    .getElementById('numberStyle')
    .addEventListener('change', generateImage);
  document
    .getElementById('fontStyle')
    .addEventListener('change', generateImage);

  // Set initial text values from color pickers
  document.getElementById('colour1Text').value =
    document.getElementById('colour1').value;
  document.getElementById('colour2Text').value =
    document.getElementById('colour2').value;
  document.getElementById('colourTextText').value =
    document.getElementById('colourText').value;

  // Initial generation
  generateImage();
});

function updateSliderBackground(slider) {
  const value = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.backgroundSize = value + '% 100%';
}

// Handle text input changes
function handleTextInput(e) {
  const inputId = e.target.id;

  // Only handle hex code text inputs
  if (inputId.endsWith('Text')) {
    const colorPickerId = inputId.replace('Text', '');
    const colorPicker = document.getElementById(colorPickerId);
    const hexColor = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
      colorPicker.value = hexColor;
      generateImage();
    }
  } else {
    // For non-color text inputs (like width, height, etc)
    generateImage();
  }
}

function getFontStyle() {
  const fontSelect = document.getElementById('fontStyle');
  const [fontFamily, weightStyle] = fontSelect.value.split('-');

  // Parse the weight and style
  let weight = '400';
  let style = 'normal';

  if (weightStyle.endsWith('i')) {
    weight = weightStyle.slice(0, -1);
    style = 'italic';
  } else {
    weight = weightStyle;
  }

  return {
    family: fontFamily,
    weight: weight,
    style: style,
  };
}

function generateImage() {
  var canvasWidth = parseInt(document.getElementById('canvasWidth').value);
  var canvasHeight = parseInt(document.getElementById('canvasHeight').value);
  var pixels = parseInt(document.getElementById('pixelCount').value);
  var color1 = document.getElementById('colour1').value;
  var color2 = document.getElementById('colour2').value;
  var colorText = document.getElementById('colourText').value;
  var opacity = parseInt(document.getElementById('opacity').value) || 100;
  const fontStyle = getFontStyle();

  // Update text inputs with current color values
  document.getElementById('colour1Text').value = color1.toUpperCase();
  document.getElementById('colour2Text').value = color2.toUpperCase();
  document.getElementById('colourTextText').value = colorText.toUpperCase();

  var canvas = document.getElementById('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  var ctx = canvas.getContext('2d');

  if (canvasWidth <= 0 || canvasHeight <= 0) {
    return;
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw white background
  ctx.globalAlpha = 0;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = opacity / 100;

  // Calculate and draw the pixels to the screen
  const pixelWidth = canvasWidth / 60;
  const pixelHeight = canvasHeight / 12;
  const pixelY = canvasHeight / 2 - pixelHeight / 2;

  // Get text size percentage and calculate actual size
  const textSizePercent =
    parseInt(document.getElementById('textSize').value) / 100;
  const singleDigitHeight = pixelHeight * textSizePercent;
  function setFont(size) {
    ctx.font = `${fontStyle.style} ${fontStyle.weight} ${size}px "${fontStyle.family}"`;
  }
  setFont(singleDigitHeight);

  function formatNumber(num) {
    num = Math.abs(num);
    if (num < 10) return num.toString();
    return num.toString().split('').join('\n');
  }

  for (let i = -pixels; i < pixels; i++) {
    var pixelX = canvasWidth / 2 + i * pixelWidth;
    ctx.fillStyle = color1;
    if (Math.abs(i % 2) === 1) {
      ctx.fillStyle = color2;
    }
    ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);

    // Add the number in the center of each rectangle
    var num = i < 0 ? Math.abs(i) : i + 1;
    var formattedNum = formatNumber(num);

    // Set text color with full opacity
    ctx.globalAlpha = 1;
    ctx.fillStyle = colorText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (num < 10) {
      // Single digit - center normally
      setFont(singleDigitHeight);
      ctx.fillText(
        formattedNum,
        pixelX + pixelWidth / 2,
        pixelY + pixelHeight / 2
      );
    } else {
      const numberStyle = document.getElementById('numberStyle').value;

      if (numberStyle === 'stacked') {
        // Original stacked style
        setFont(singleDigitHeight);
        const lines = formattedNum.split('\n');
        const lineHeight = singleDigitHeight;
        const totalHeight = lineHeight * lines.length;
        const startY =
          pixelY + (pixelHeight - totalHeight) / 2 + lineHeight / 2;

        lines.forEach((line, index) => {
          ctx.fillText(
            line,
            pixelX + pixelWidth / 2,
            startY + lineHeight * index
          );
        });
      } else {
        // Compact style with small first digit
        const digits = num.toString().split('');

        // Draw second digit at normal size in the same position as single digits
        setFont(singleDigitHeight);
        ctx.fillText(
          digits[1],
          pixelX + pixelWidth / 2,
          pixelY + pixelHeight / 2
        );

        // Draw first digit smaller and above
        const smallDigitHeight = singleDigitHeight * 0.6; // 60% of normal size
        setFont(smallDigitHeight);
        ctx.fillText(
          digits[0],
          pixelX + pixelWidth / 2,
          pixelY + pixelHeight / 2 - singleDigitHeight * 0.7
        );

        // Reset font for next number
        setFont(singleDigitHeight);
      }
    }

    // Reset opacity for next rectangle
    ctx.globalAlpha = opacity / 100;
  }

  // Draw the crosshair to the screen
  ctx.globalAlpha = 1;
  var crosshairWidth = 0.003125 * canvasWidth;
  var crosshairHeight = canvasHeight;
  var crosshairX = canvasWidth / 2 - crosshairWidth;
  var crosshairY = 0;

  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(crosshairX, crosshairY, crosshairWidth, crosshairHeight);

  var cropLeft = 'Left: ' + (canvasWidth - 60) / 2;
  var cropRight = 'Right: ' + (canvasWidth - 60) / 2;
  var cropTop = 'Top: ' + (canvasHeight - 580) / 2;
  var cropBottom = 'Bottom: ' + (canvasHeight - 580) / 2;

  document.getElementById('cropLeft').innerHTML = cropLeft;
  document.getElementById('cropRight').innerHTML = cropRight;
  document.getElementById('cropTop').innerHTML = cropTop;
  document.getElementById('cropBottom').innerHTML = cropBottom;

  // Enable download button
  document.getElementById('downloadBtn').disabled = false;
}

function downloadImage() {
  var canvas = document.getElementById('canvas');
  var link = document.createElement('a');
  link.href = canvas.toDataURL();
  link.download = 'overlay.png';
  link.click();
}
