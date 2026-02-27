const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

class Pagination {
  constructor(interaction, pages, options = {}) {
    this.interaction = interaction;
    this.pages = pages;
    this.currentPage = 0;
    this.timeout = options.timeout || 60000;
    this.ephemeral = options.ephemeral || false;
    this.row = null;
    this.message = null;
    this.collector = null;
  }

  createButtons() {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("first")
          .setEmoji("⏪")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(this.currentPage === 0),
        new ButtonBuilder()
          .setCustomId("previous")
          .setEmoji("◀️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(this.currentPage === 0),
        new ButtonBuilder()
          .setCustomId("page")
          .setLabel(`${this.currentPage + 1}/${this.pages.length}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(this.currentPage === this.pages.length - 1),
        new ButtonBuilder()
          .setCustomId("last")
          .setEmoji("⏩")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(this.currentPage === this.pages.length - 1)
      );

    return row;
  }

  createCompactButtons() {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setEmoji("◀️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(this.currentPage === 0),
        new ButtonBuilder()
          .setCustomId("page")
          .setLabel(`${this.currentPage + 1}/${this.pages.length}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(this.currentPage === this.pages.length - 1)
      );

    return row;
  }

  async send(channel = null) {
    if (!this.pages.length) return null;
    
    this.row = this.createButtons();
    
    if (channel) {
      this.message = await channel.send({
        embeds: [this.pages[this.currentPage]],
        components: [this.row]
      });
    } else {
      this.message = await this.interaction.reply({
        embeds: [this.pages[this.currentPage]],
        components: [this.row],
        ephemeral: this.ephemeral,
        fetchReply: true
      });
    }

    this.collector = this.message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: this.timeout
    });

    this.collector.on("collect", async (i) => {
      if (i.user.id !== this.interaction.user.id) {
        return i.reply({
          content: "You cannot use these buttons.",
          ephemeral: true
        });
      }

      switch (i.customId) {
        case "first":
          this.currentPage = 0;
          break;
        case "previous":
          this.currentPage--;
          break;
        case "next":
          this.currentPage++;
          break;
        case "last":
          this.currentPage = this.pages.length - 1;
          break;
      }

      this.row = this.createButtons();

      await i.update({
        embeds: [this.pages[this.currentPage]],
        components: [this.row]
      });
    });

    this.collector.on("end", () => {
      if (this.message.editable) {
        const disabledRow = this.createButtons();
        disabledRow.components.forEach(button => button.setDisabled(true));
        
        this.message.edit({ components: [disabledRow] }).catch(() => {});
      }
    });

    return this.message;
  }

  async sendCompact() {
    this.row = this.createCompactButtons();
    
    this.message = await this.interaction.reply({
      embeds: [this.pages[this.currentPage]],
      components: [this.row],
      ephemeral: this.ephemeral,
      fetchReply: true
    });

    this.collector = this.message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: this.timeout
    });

    this.collector.on("collect", async (i) => {
      if (i.user.id !== this.interaction.user.id) {
        return i.reply({
          content: "You cannot use these buttons.",
          ephemeral: true
        });
      }

      switch (i.customId) {
        case "previous":
          this.currentPage--;
          break;
        case "next":
          this.currentPage++;
          break;
      }

      this.row = this.createCompactButtons();

      await i.update({
        embeds: [this.pages[this.currentPage]],
        components: [this.row]
      });
    });

    this.collector.on("end", () => {
      if (this.message.editable) {
        const disabledRow = this.createCompactButtons();
        disabledRow.components.forEach(button => button.setDisabled(true));
        
        this.message.edit({ components: [disabledRow] }).catch(() => {});
      }
    });

    return this.message;
  }

  async addPage(page) {
    this.pages.push(page);
    return this;
  }

  async removePage(index) {
    if (index >= 0 && index < this.pages.length) {
      this.pages.splice(index, 1);
      if (this.currentPage >= this.pages.length) {
        this.currentPage = this.pages.length - 1;
      }
    }
    return this;
  }

  async goToPage(index) {
    if (index >= 0 && index < this.pages.length) {
      this.currentPage = index;
      
      if (this.message && this.message.editable) {
        this.row = this.createButtons();
        await this.message.edit({
          embeds: [this.pages[this.currentPage]],
          components: [this.row]
        });
      }
    }
    return this;
  }

  async stop() {
    if (this.collector) {
      this.collector.stop();
    }
    return this;
  }

  get current() {
    return this.pages[this.currentPage];
  }

  get total() {
    return this.pages.length;
  }
}

module.exports = Pagination;