const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");
const fs = require("fs");

class CanvasGenerator {
  constructor() {
    this.registerFonts();
  }

  registerFonts() {
    const fontPath = path.join(__dirname, "../../../assets/fonts");
    
    // Register fonts if they exist
    if (fs.existsSync(path.join(fontPath, "Poppins-Regular.ttf"))) {
      registerFont(path.join(fontPath, "Poppins-Regular.ttf"), { family: "Poppins" });
    }
    
    if (fs.existsSync(path.join(fontPath, "Poppins-Bold.ttf"))) {
      registerFont(path.join(fontPath, "Poppins-Bold.ttf"), { family: "Poppins", weight: "bold" });
    }
  }

  async generateWelcomeImage(member, template = "classic") {
    switch (template) {
      case "classic":
        return await this.classicWelcome(member);
      case "modern":
        return await this.modernWelcome(member);
      case "gaming":
        return await this.gamingWelcome(member);
      case "minimal":
        return await this.minimalWelcome(member);
      default:
        return await this.classicWelcome(member);
    }
  }

  async generateGoodbyeImage(member, template = "classic") {
    switch (template) {
      case "classic":
        return await this.classicGoodbye(member);
      case "modern":
        return await this.modernGoodbye(member);
      case "gaming":
        return await this.gamingGoodbye(member);
      case "minimal":
        return await this.minimalGoodbye(member);
      default:
        return await this.classicGoodbye(member);
    }
  }

  async classicWelcome(member) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");
    
    // Background
    ctx.fillStyle = "#2C2F33";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#6B4EFF");
    gradient.addColorStop(1, "#4A2FCC");
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    
    // Avatar
    const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const avatar = await loadImage(avatarURL);
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 200, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 100, 100, 200, 200);
    ctx.restore();
    
    // Border
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(200, 200, 100, 0, Math.PI * 2);
    ctx.stroke();
    
    // Text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 40px 'Poppins'";
    ctx.fillText("WELCOME", 350, 180);
    
    ctx.font = "bold 50px 'Poppins'";
    ctx.fillText(member.user.username, 350, 250);
    
    ctx.font = "20px 'Poppins'";
    ctx.fillText(`Member #${member.guild.memberCount}`, 350, 300);
    
    return canvas.toBuffer();
  }

  async modernWelcome(member) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");
    
    // Background with pattern
    ctx.fillStyle = "#0F0F0F";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Diagonal lines
    ctx.strokeStyle = "#6B4EFF";
    ctx.lineWidth = 2;
    for (let i = -200; i < canvas.width + 200; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i - 400, canvas.height);
      ctx.strokeStyle = "#6B4EFF20";
      ctx.stroke();
    }
    
    // Avatar
    const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const avatar = await loadImage(avatarURL);
    
    // Avatar with modern border
    ctx.save();
    ctx.shadowColor = "#6B4EFF";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(200, 200, 110, 0, Math.PI * 2);
    ctx.fillStyle = "#6B4EFF";
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.beginPath();
    ctx.arc(200, 200, 100, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 100, 100, 200, 200);
    ctx.restore();
    
    // Text with glow
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "#6B4EFF";
    ctx.shadowBlur = 15;
    ctx.font = "bold 45px 'Poppins'";
    ctx.fillText("WELCOME TO", 350, 180);
    
    ctx.font = "bold 60px 'Poppins'";
    ctx.fillText(member.guild.name, 350, 250);
    
    ctx.shadowBlur = 10;
    ctx.font = "25px 'Poppins'";
    ctx.fillText(`${member.user.username} joined the server`, 350, 320);
    
    return canvas.toBuffer();
  }

  async gamingWelcome(member) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");
    
    // Gaming style background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f3460");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid pattern
    ctx.strokeStyle = "#6B4EFF40";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    // Avatar with gaming border
    const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const avatar = await loadImage(avatarURL);
    
    // Hexagon shape
    ctx.save();
    ctx.translate(200, 200);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 30) * Math.PI / 180;
      const x = 100 * Math.cos(angle);
      const y = 100 * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 100, 100, 200, 200);
    ctx.restore();
    
    // Gaming text
    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 35px 'Poppins'";
    ctx.fillText("NEW PLAYER", 350, 180);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 55px 'Poppins'";
    ctx.fillText(member.user.username, 350, 250);
    
    ctx.fillStyle = "#00ff88";
    ctx.font = "20px 'Poppins'";
    ctx.fillText(`LEVEL 1 • ${member.guild.memberCount} PLAYERS ONLINE`, 350, 320);
    
    return canvas.toBuffer();
  }

  async minimalWelcome(member) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");
    
    // Clean white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simple line
    ctx.fillStyle = "#6B4EFF";
    ctx.fillRect(0, 150, canvas.width, 2);
    
    // Avatar with minimal border
    const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const avatar = await loadImage(avatarURL);
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 200, 80, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 120, 120, 160, 160);
    ctx.restore();
    
    // Minimal text
    ctx.fillStyle = "#000000";
    ctx.font = "30px 'Poppins'";
    ctx.fillText("Welcome", 350, 180);
    
    ctx.fillStyle = "#6B4EFF";
    ctx.font = "bold 50px 'Poppins'";
    ctx.fillText(member.user.username, 350, 250);
    
    ctx.fillStyle = "#666666";
    ctx.font = "18px 'Poppins'";
    ctx.fillText(`#${member.guild.memberCount} • ${member.guild.name}`, 350, 310);
    
    return canvas.toBuffer();
  }

  async classicGoodbye(member) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");
    
    // Background
    ctx.fillStyle = "#2C2F33";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#ED4245");
    gradient.addColorStop(1, "#992D2F");
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    
    // Avatar
    const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const avatar = await loadImage(avatarURL);
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 200, 100, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 100, 100, 200, 200);
    ctx.restore();
    
    // Text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 40px 'Poppins'";
    ctx.fillText("GOODBYE", 350, 200);
    
    ctx.font = "bold 50px 'Poppins'";
    ctx.fillText(member.user.username, 350, 270);
    
    return canvas.toBuffer();
  }

  async modernGoodbye(member) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");
    
    // Dark background
    ctx.fillStyle = "#0F0F0F";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Faded avatar in background
    const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const avatar = await loadImage(avatarURL);
    ctx.globalAlpha = 0.1;
    ctx.drawImage(avatar, 300, 50, 400, 400);
    ctx.globalAlpha = 1;
    
    // Text
    ctx.fillStyle = "#ED4245";
    ctx.font = "bold 60px 'Poppins'";
    ctx.fillText("GOODBYE", 100, 150);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 50px 'Poppins'";
    ctx.fillText(member.user.username, 100, 250);
    
    ctx.font = "25px 'Poppins'";
    ctx.fillText(`We'll miss you!`, 100, 320);
    
    return canvas.toBuffer();
  }

  async gamingGoodbye(member) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");
    
    // Gaming background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pixelated effect
    ctx.fillStyle = "#ED424520";
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        ctx.fillRect(i, j, 10, 10);
      }
    }
    
    // Text
    ctx.fillStyle = "#ED4245";
    ctx.font = "bold 40px 'Poppins'";
    ctx.fillText("PLAYER LEFT", 100, 150);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 60px 'Poppins'";
    ctx.fillText(member.user.username, 100, 250);
    
    ctx.fillStyle = "#ED4245";
    ctx.font = "25px 'Poppins'";
    ctx.fillText(`LEVEL ${Math.floor(member.joinedTimestamp / 1000000) || 1}`, 100, 320);
    
    return canvas.toBuffer();
  }

  async minimalGoodbye(member) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");
    
    // Clean background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simple red line
    ctx.fillStyle = "#ED4245";
    ctx.fillRect(0, 200, canvas.width, 2);
    
    // Text
    ctx.fillStyle = "#000000";
    ctx.font = "30px 'Poppins'";
    ctx.fillText("Goodbye", 100, 150);
    
    ctx.fillStyle = "#ED4245";
    ctx.font = "bold 50px 'Poppins'";
    ctx.fillText(member.user.username, 100, 250);
    
    return canvas.toBuffer();
  }
}

module.exports = new CanvasGenerator();