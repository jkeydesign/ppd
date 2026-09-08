document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('logoCanvas');
  const ctx = canvas.getContext('2d');
  const nodeHoverTooltip = document.getElementById('nodeHoverTooltip');

  // Input elements
  const inputName = document.getElementById('inputName');
  const inputSubtext = document.getElementById('inputSubtext');
  const chkShowGuideNodes = document.getElementById('chkShowGuideNodes');
  const chkShowOuterCircle = document.getElementById('chkShowOuterCircle');
  const btnDownloadJpeg = document.getElementById('btnDownloadJpeg');

  // Modal elements
  const btnSurveyGuide = document.getElementById('btnSurveyGuide');
  const surveyModal = document.getElementById('surveyModal');
  const btnCloseModal = document.getElementById('btnCloseModal');

  // Color Sequences (Automatically sorted in numerical order: 1 -> 2 -> 3...)
  const sequences = {
    blue: [1, 2, 4, 8],
    red: [1, 2, 4, 5, 8],
    yellow: [3, 6, 7]
  };

  // Item Descriptions Metadata for Tooltips & Hover
  const itemLabels = {
    blue: {
      1: '여성스럽다', 2: '귀엽다', 3: '소박하다', 4: '피부가 좋다',
      5: '목소리가 좋다', 6: '남성스럽다', 7: '섹시하다', 8: '화려하다'
    },
    red: {
      1: '활발하다', 2: '재미있다', 3: '친절하다', 4: '지적이다',
      5: '솔직하다', 6: '얌전하다', 7: '과묵하다', 8: '까칠하다'
    },
    yellow: {
      1: '독서·미술', 2: '음악·영화', 3: '외국어', 4: '종교',
      5: '요리', 6: '운동·댄스', 7: '쇼핑', 8: '게임'
    }
  };

  // Color Definitions & Stroke Widths (1000x1000 Canvas resolution)
  // Hierarchy: Blue (thickest) > Red (medium) > Yellow (thinnest)
  const colorSpecs = {
    yellow: {
      color: '#F7B500',
      nodeColor: '#F7B500',
      lineWidth: 8,    // Thinnest (Yellow)
      dotRadius: 10
    },
    red: {
      color: '#EC008C',
      nodeColor: '#EC008C',
      lineWidth: 16,   // Medium (Red/Magenta)
      dotRadius: 13
    },
    blue: {
      color: '#00AEEF',
      nodeColor: '#00AEEF',
      lineWidth: 28,   // Thickest (Blue)
      dotRadius: 16
    }
  };

  // Grid node coordinates for 1000x1000 Canvas
  // 1: TL, 2: TC, 3: TR
  // 4: ML,       5: MR
  // 6: BL, 7: BC, 8: BR
  const nodeCoords = {
    1: { x: 300, y: 300 },
    2: { x: 500, y: 300 },
    3: { x: 700, y: 300 },
    4: { x: 300, y: 500 },
    5: { x: 700, y: 500 },
    6: { x: 300, y: 700 },
    7: { x: 500, y: 700 },
    8: { x: 700, y: 700 }
  };

  const center = { x: 500, y: 500 };
  const outerCircleRadius = 420;

  let hoveredNodeNum = null;

  // Initialize UI & Event Listeners
  function init() {
    setupButtonEvents();
    setupPresets();
    setupModalEvents();
    setupCanvasHover();
    
    // Inputs change listeners
    inputName.addEventListener('input', draw);
    inputSubtext.addEventListener('input', draw);
    chkShowGuideNodes.addEventListener('change', draw);
    chkShowOuterCircle.addEventListener('change', draw);

    btnDownloadJpeg.addEventListener('click', downloadAsJpeg);

    updateUIState();
    draw();
  }

  // Setup click listeners for number buttons
  function setupButtonEvents() {
    document.querySelectorAll('.group-container').forEach(grid => {
      const color = grid.dataset.color;
      grid.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const num = parseInt(btn.dataset.num, 10);
          toggleNumberInSequence(color, num);
        });
      });
    });

    document.querySelectorAll('.btn-clear').forEach(btn => {
      const color = btn.dataset.color;
      btn.addEventListener('click', () => {
        sequences[color] = [];
        updateUIState();
        draw();
      });
    });
  }

  // Pairwise opposite mapping: 1 <-> 6, 2 <-> 7, 3 <-> 8
  const oppositePairs = {
    1: 6, 6: 1,
    2: 7, 7: 2,
    3: 8, 8: 3
  };

  function toggleNumberInSequence(color, num) {
    const seq = sequences[color];
    const index = seq.indexOf(num);

    if (index !== -1) {
      // 이미 선택된 번호인 경우 시퀀스에서 제거 (해제)
      seq.splice(index, 1);
    } else {
      // 1:1 상반 번호 검증 (1 <-> 6, 2 <-> 7, 3 <-> 8)
      const opposite = oppositePairs[num];
      if (opposite && seq.includes(opposite)) {
        const numLabel = itemLabels[color][num];
        const oppLabel = itemLabels[color][opposite];
        alert(`ⓐ A ≠ B 1:1 상반 규칙: ${opposite}번(${oppLabel})이 이미 선택되어 있어 상반되는 ${num}번(${numLabel})은 선 잇기에서 제외됩니다.`);
        return;
      }

      seq.push(num);
      // 번호 순서대로 자동 정렬 (1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 순으로 선 자동 연결)
      seq.sort((a, b) => a - b);
    }
    updateUIState();
    draw();
  }

  function updateUIState() {
    ['blue', 'red', 'yellow'].forEach(color => {
      const seq = sequences[color];
      const seqDisplay = document.getElementById(`${color}Sequence`);
      const grid = document.querySelector(`.group-container[data-color="${color}"]`);

      const hasGroupAorB = seq.some(n => [1, 2, 3, 6, 7, 8].includes(n));
      const hasC = seq.some(n => [4, 5].includes(n));

      // Update sequence display text
      if (seq.length === 0) {
        seqDisplay.textContent = '선택 없음';
      } else {
        let warningText = '';
        if (hasC && !hasGroupAorB) {
          warningText = ' (⚠️ C그룹 4/5번은 A나 B항목과 함께 선택해야 함)';
        }
        seqDisplay.textContent = seq.map(n => `${n}(${itemLabels[color][n]})`).join(' → ') + warningText;
      }

      // Highlight active & disabled buttons based on 1:1 opposite pairs
      grid.querySelectorAll('.num-btn').forEach(btn => {
        const num = parseInt(btn.dataset.num, 10);
        const opposite = oppositePairs[num];
        
        const isSelected = seq.includes(num);
        const isDisabled = opposite && seq.includes(opposite);

        if (isSelected) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }

        if (isDisabled) {
          btn.classList.add('disabled');
          btn.disabled = true;
          btn.title = `상반 항목 ${opposite}번이 이미 선택되어 ${num}번은 제외됩니다.`;
        } else {
          btn.classList.remove('disabled');
          btn.disabled = false;
          btn.title = `${num}번 ${color === 'blue' ? '외모' : color === 'red' ? '성격' : '취미'}: ${itemLabels[color][num]}`;
        }
      });
    });
  }

  // Setup Canvas Mouse Hover Interaction
  function setupCanvasHover() {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      let foundNode = null;
      for (let i = 1; i <= 8; i++) {
        const coord = nodeCoords[i];
        const dist = Math.hypot(mouseX - coord.x, mouseY - coord.y);
        if (dist <= 45) { // Hover hit radius
          foundNode = i;
          break;
        }
      }

      if (foundNode) {
        if (hoveredNodeNum !== foundNode) {
          hoveredNodeNum = foundNode;
          draw();
        }
        
        // Show floating tooltip element
        const tooltipX = e.clientX - rect.left;
        const tooltipY = e.clientY - rect.top;

        nodeHoverTooltip.style.left = `${tooltipX}px`;
        nodeHoverTooltip.style.top = `${tooltipY}px`;
        nodeHoverTooltip.innerHTML = `
          <h5>📍 노드 ${foundNode}번 설명</h5>
          <ul>
            <li>🟦 외모: <strong>${itemLabels.blue[foundNode]}</strong></li>
            <li>🟥 성격: <strong>${itemLabels.red[foundNode]}</strong></li>
            <li>🟨 취미: <strong>${itemLabels.yellow[foundNode]}</strong></li>
          </ul>
        `;
        nodeHoverTooltip.classList.remove('hidden');
      } else {
        if (hoveredNodeNum !== null) {
          hoveredNodeNum = null;
          draw();
        }
        nodeHoverTooltip.classList.add('hidden');
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (hoveredNodeNum !== null) {
        hoveredNodeNum = null;
        draw();
      }
      nodeHoverTooltip.classList.add('hidden');
    });
  }

  // Presets configuration
  function setupPresets() {
    const presets = {
      preset1: {
        name: 'LEE SANG GYU',
        subtext: 'Design by',
        blue: [1, 3, 8],
        red: [2, 6, 8],
        yellow: [3, 6, 7]
      },
      preset2: {
        name: 'KIM YOUNG SANG',
        subtext: 'Design by',
        blue: [3, 6],
        red: [2, 7, 8],
        yellow: [2, 7]
      },
      preset3: {
        name: 'KANG DOO SOO',
        subtext: 'Design by',
        blue: [1, 3, 4, 5, 8],
        red: [1, 3, 7],
        yellow: [1, 3, 6, 8]
      },
      preset4: {
        name: 'SEO HYUN YOUNG',
        subtext: 'Design by',
        blue: [3, 6],
        red: [1, 3, 8],
        yellow: [1, 3, 6]
      }
    };

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        const preset = presets[presetKey];
        if (preset) {
          inputName.value = preset.name;
          inputSubtext.value = preset.subtext;
          sequences.blue = [...preset.blue].sort((a, b) => a - b);
          sequences.red = [...preset.red].sort((a, b) => a - b);
          sequences.yellow = [...preset.yellow].sort((a, b) => a - b);
          updateUIState();
          draw();
        }
      });
    });
  }

  function setupModalEvents() {
    btnSurveyGuide.addEventListener('click', () => surveyModal.classList.remove('hidden'));
    btnCloseModal.addEventListener('click', () => surveyModal.classList.add('hidden'));
    surveyModal.addEventListener('click', (e) => {
      if (e.target === surveyModal) surveyModal.classList.add('hidden');
    });
  }

  // Main Canvas Rendering Engine
  function draw() {
    // Clear canvas with clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Outer Circle Frame
    if (chkShowOuterCircle.checked) {
      ctx.beginPath();
      ctx.arc(center.x, center.y, outerCircleRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 2. Draw Curved English Name along top arc
    const nameText = inputName.value.trim().toUpperCase();
    if (nameText) {
      drawArchedText(nameText, center.x, center.y, outerCircleRadius - 15, Math.PI * 1.5);
    }

    // 3. Draw Subtext (e.g. Design by)
    const subtext = inputSubtext.value.trim();
    if (subtext) {
      ctx.font = '500 22px "Montserrat", sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(subtext, center.x, center.y + outerCircleRadius + 20);
    }

    // 4. Draw Diagram Lines in Layer Order: Blue (Bottom base) -> Red (Middle) -> Yellow (Topmost)
    // Ensures Yellow line is drawn ON TOP at the very top layer
    ['blue', 'red', 'yellow'].forEach(colorKey => {
      const seq = sequences[colorKey];
      const spec = colorSpecs[colorKey];

      if (seq.length >= 2) {
        ctx.beginPath();
        const startCoord = nodeCoords[seq[0]];
        ctx.moveTo(startCoord.x, startCoord.y);

        for (let i = 1; i < seq.length; i++) {
          const coord = nodeCoords[seq[i]];
          ctx.lineTo(coord.x, coord.y);
        }

        ctx.strokeStyle = spec.color;
        ctx.lineWidth = spec.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    });

    // 5. Draw Node Dots in Layer Order: Blue (Bottom) -> Red (Middle) -> Yellow (Topmost)
    ['blue', 'red', 'yellow'].forEach(colorKey => {
      const seq = sequences[colorKey];
      const spec = colorSpecs[colorKey];

      // Unique selected nodes
      const uniqueNodes = [...new Set(seq)];
      uniqueNodes.forEach(nodeNum => {
        const coord = nodeCoords[nodeNum];
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, spec.dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = spec.nodeColor;
        ctx.fill();
      });
    });

    // 6. Draw Guide Grid Dots & Numbers (Optional)
    if (chkShowGuideNodes.checked) {
      drawGuideNodes();
    }

    // 7. Draw Highlight Ring around Hovered Node
    if (hoveredNodeNum) {
      const coord = nodeCoords[hoveredNodeNum];
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash
    }
  }

  // Helper to draw text along upper circle arc
  function drawArchedText(text, cx, cy, radius, startAngle) {
    ctx.save();
    // Noto Sans KR Medium (weight 500), 52px size (약 2배 확대)
    ctx.font = '500 52px "Noto Sans KR", "Montserrat", sans-serif';
    ctx.fillStyle = '#1E293B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Measure exact character widths & apply generous letter spacing (18px)
    const letterSpacingPx = 18;
    const charAngles = [];
    let totalArcAngle = 0;

    for (let i = 0; i < text.length; i++) {
      const charWidth = ctx.measureText(text[i]).width;
      const angle = (charWidth + letterSpacingPx) / radius;
      charAngles.push(angle);
      totalArcAngle += angle;
    }

    // Start angle centered around top (Math.PI * 1.5)
    let currentAngle = startAngle - (totalArcAngle / 2) + (charAngles[0] / 2);

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.save();
      // Position character on circle
      ctx.translate(
        cx + radius * Math.cos(currentAngle),
        cy + radius * Math.sin(currentAngle)
      );
      // Rotate character tangent to circle
      ctx.rotate(currentAngle + Math.PI / 2);
      ctx.fillText(char, 0, 0);
      ctx.restore();

      if (i < text.length - 1) {
        currentAngle += (charAngles[i] / 2) + (charAngles[i + 1] / 2);
      }
    }

    ctx.restore();
  }

  // Draw 1~8 guide node markers
  function drawGuideNodes() {
    for (let i = 1; i <= 8; i++) {
      const coord = nodeCoords[i];
      
      // Draw outer subtle circle
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(156, 163, 175, 0.4)';
      ctx.fill();

      // Number text
      ctx.font = '600 16px "Montserrat", sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Slightly offset number labels
      let offsetX = 0;
      let offsetY = -18;
      if (i === 1 || i === 4 || i === 6) offsetX = -18;
      if (i === 3 || i === 5 || i === 8) offsetX = 18;
      if (i === 6 || i === 7 || i === 8) offsetY = 20;

      ctx.fillText(i.toString(), coord.x + offsetX, coord.y + offsetY);
    }
  }

  // Export Canvas as High-Res JPEG Download
  function downloadAsJpeg() {
    // Temporarily clear hover effect for clean download
    const tempHover = hoveredNodeNum;
    hoveredNodeNum = null;
    draw();

    // Create download link
    const imageURI = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    
    // Format filename based on English name
    const rawName = inputName.value.trim() || 'brand_logo';
    const cleanName = rawName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    link.download = `${cleanName}_brand_logo.jpg`;
    link.href = imageURI;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Restore hover state if any
    hoveredNodeNum = tempHover;
    draw();
  }

  init();
});
