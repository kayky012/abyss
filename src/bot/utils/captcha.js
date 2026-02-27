const { createCanvas } = require("canvas");

class CaptchaGenerator {
  constructor() {
    this.characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  }

  generateText() {
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += this.characters.charAt(Math.floor(Math.random() * this.characters.length));
    }
    return text;
  }

  async generateImage(text) {
    const canvas = createCanvas(300, 100);
    const ctx = canvas.getContext("2d");
    
    // Background
    ctx.fillStyle = "#F0F0F0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Noise lines
    ctx.strokeStyle = "#CCCCCC";
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Text with random colors
    for (let i = 0; i < text.length; i++) {
      const x = 30 + i * 40;
      const y = 60 + Math.random() * 20;
      
      // Random rotation
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.2);
      
      // Random color
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 40%)`;
      ctx.font = `bold ${30 + Math.random() * 10}px 'Poppins'`;
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
    
    // Dots
    ctx.fillStyle = "#999999";
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return canvas.toBuffer();
  }

  async generateSimple(text) {
    const canvas = createCanvas(200, 80);
    const ctx = canvas.getContext("2d");
    
    // Clean background
    ctx.fillStyle = "#2C2F33";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 40px 'Poppins'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    return canvas.toBuffer();
  }

  async generateMath() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = ["+", "-", "×"][Math.floor(Math.random() * 3)];
    
    let result;
    let text;
    
    switch (operator) {
      case "+":
        result = num1 + num2;
        text = `${num1} + ${num2}`;
        break;
      case "-":
        result = Math.max(num1, num2) - Math.min(num1, num2);
        text = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;
        break;
      case "×":
        result = num1 * num2;
        text = `${num1} × ${num2}`;
        break;
    }
    
    const canvas = createCanvas(250, 100);
    const ctx = canvas.getContext("2d");
    
    // Background
    ctx.fillStyle = "#2C2F33";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 50px 'Poppins'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text + " = ?", canvas.width / 2, canvas.height / 2);
    
    return {
      buffer: canvas.toBuffer(),
      answer: result.toString()
    };
  }

  async generateEmoji() {
    const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐸"];
    const correct = emojis[Math.floor(Math.random() * emojis.length)];
    
    const canvas = createCanvas(300, 100);
    const ctx = canvas.getContext("2d");
    
    // Background
    ctx.fillStyle = "#2C2F33";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Emoji row
    ctx.font = "40px 'Segoe UI Emoji'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const shuffled = [...emojis].sort(() => Math.random() - 0.5).slice(0, 5);
    
    for (let i = 0; i < shuffled.length; i++) {
      ctx.fillStyle = shuffled[i] === correct ? "#6B4EFF" : "#FFFFFF";
      ctx.fillText(shuffled[i], 50 + i * 50, 50);
    }
    
    return {
      buffer: canvas.toBuffer(),
      answer: correct
    };
  }

  validate(text, userInput) {
    return text.toUpperCase() === userInput.toUpperCase();
  }

  validateMath(answer, userInput) {
    return answer === userInput.toString();
  }

  validateEmoji(answer, userInput) {
    return answer === userInput;
  }
}

module.exports = new CaptchaGenerator();