let isAnimating = false;
let colorIndex = 0;
let themeIndex = 0;

function toggleAnimation() {
    const title = document.getElementById('mainTitle');
    isAnimating = !isAnimating;
    
    if (isAnimating) {
        title.classList.add('pulse-animation');
    } else {
        title.classList.remove('pulse-animation');
    }
}

function changeColor() {
    const colors = [
        { primary: '#00d9ff', shadow: '0 0 10px #00d9ff, 0 0 20px #00d9ff, 0 0 40px #00d9ff' },
        { primary: '#ff00ff', shadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff' },
        { primary: '#00ff88', shadow: '0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 40px #00ff88' },
        { primary: '#ffdd00', shadow: '0 0 10px #ffdd00, 0 0 20px #ffdd00, 0 0 40px #ffdd00' }
    ];
    
    colorIndex = (colorIndex + 1) % colors.length;
    const selectedColor = colors[colorIndex];
    
    const title = document.getElementById('mainTitle');
    const mainTitleHeader = document.querySelector('header h1');
    const buttons = document.querySelectorAll('.neon-button');
    const content = document.getElementById('mainContent');
    const header = document.querySelector('header');

    title.style.color = selectedColor.primary;
    title.style.textShadow = selectedColor.shadow;

    mainTitleHeader.style.color = selectedColor.primary;
    mainTitleHeader.style.textShadow = selectedColor.shadow;
    
    header.style.borderColor = selectedColor.primary;
    header.style.boxShadow = `0 0 20px ${selectedColor.primary}`;

    buttons.forEach(button => {
        button.style.borderColor = selectedColor.primary;
        button.style.color = selectedColor.primary;
        button.style.boxShadow = `0 0 10px ${selectedColor.primary}, inset 0 0 10px ${selectedColor.primary}`;
    });

    content.style.borderColor = selectedColor.primary;
    content.style.boxShadow = `0 0 10px ${selectedColor.primary}, inset 0 0 10px ${selectedColor.primary}`;
}

function changeTheme() {
    const themes = ['#0a0e27', '#1a0a27', '#0a2715', '#270a1e'];
    themeIndex = (themeIndex + 1) % themes.length;
    document.body.style.background = themes[themeIndex];
}

function resetPage() {
    location.reload();
}

document.querySelectorAll('.neon-button').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

const konamiCode = [
  'ArrowUp', 'ArrowUp', 
  'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 
  'ArrowLeft', 'ArrowRight', 
  'b', 'a'
];

let cursor = 0; 

document.addEventListener('keydown', (e) => {

  if (e.key === konamiCode[cursor]) {
    cursor++;

    if (cursor === konamiCode.length) {
      activateEasterEgg();
      cursor = 0; 
    }
  } else {

    cursor = 0;
  }
});

function activateEasterEgg() {
  alert("🕵️ Ce code ne sert à rien");
}