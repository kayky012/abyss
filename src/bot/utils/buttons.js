const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class ButtonBuilderUtil {
  static createButton(options = {}) {
    const button = new ButtonBuilder()
      .setCustomId(options.customId || "button")
      .setLabel(options.label || "Button")
      .setStyle(options.style || ButtonStyle.Primary);

    if (options.emoji) button.setEmoji(options.emoji);
    if (options.disabled) button.setDisabled(true);
    if (options.url) button.setURL(options.url);

    return button;
  }

  static createRow(buttons) {
    return new ActionRowBuilder().addComponents(buttons);
  }

  static confirm(customId = "confirm", options = {}) {
    return this.createRow([
      this.createButton({
        customId: customId,
        label: options.confirmLabel || "Confirm",
        style: ButtonStyle.Success,
        emoji: options.confirmEmoji || "✅"
      }),
      this.createButton({
        customId: "cancel",
        label: options.cancelLabel || "Cancel",
        style: ButtonStyle.Danger,
        emoji: options.cancelEmoji || "❌"
      })
    ]);
  }

  static yesNo(customId = "yesno") {
    return this.createRow([
      this.createButton({
        customId: `${customId}_yes`,
        label: "Yes",
        style: ButtonStyle.Success,
        emoji: "✅"
      }),
      this.createButton({
        customId: `${customId}_no`,
        label: "No",
        style: ButtonStyle.Danger,
        emoji: "❌"
      })
    ]);
  }

  static pagination() {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("first")
          .setEmoji("⏪")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("previous")
          .setEmoji("◀️")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("page")
          .setLabel("1/1")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("last")
          .setEmoji("⏩")
          .setStyle(ButtonStyle.Secondary)
      );
  }

  static compactPagination() {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setEmoji("◀️")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("page")
          .setLabel("1/1")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Primary)
      );
  }

  static verification() {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("verify")
          .setLabel("Verify")
          .setStyle(ButtonStyle.Success)
          .setEmoji("✅"),
        new ButtonBuilder()
          .setCustomId("resend")
          .setLabel("Resend Code")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🔄")
      );
  }

  static captcha() {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("captcha_text")
          .setLabel("Text Captcha")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🔤"),
        new ButtonBuilder()
          .setCustomId("captcha_math")
          .setLabel("Math Captcha")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🧮"),
        new ButtonBuilder()
          .setCustomId("captcha_emoji")
          .setLabel("Emoji Captcha")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("😊")
      );
  }

  static moderation(userId) {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`warn_${userId}`)
          .setLabel("Warn")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("⚠️"),
        new ButtonBuilder()
          .setCustomId(`mute_${userId}`)
          .setLabel("Mute")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🔇"),
        new ButtonBuilder()
          .setCustomId(`kick_${userId}`)
          .setLabel("Kick")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("👢"),
        new ButtonBuilder()
          .setCustomId(`ban_${userId}`)
          .setLabel("Ban")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🔨")
      );
  }

  static ticket() {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("create_ticket")
          .setLabel("Create Ticket")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🎫"),
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Close")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🔒")
      );
  }

  static giveaway() {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("giveaway_enter")
          .setLabel("Enter")
          .setStyle(ButtonStyle.Success)
          .setEmoji("🎉"),
        new ButtonBuilder()
          .setCustomId("giveaway_end")
          .setLabel("End")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🏁")
      );
  }

  static role(roleId, roleName) {
    return new ButtonBuilder()
      .setCustomId(`role_${roleId}`)
      .setLabel(roleName)
      .setStyle(ButtonStyle.Secondary);
  }

  static roleRow(roles) {
    const row = new ActionRowBuilder();
    
    for (const role of roles.slice(0, 5)) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`role_${role.id}`)
          .setLabel(role.name)
          .setStyle(ButtonStyle.Secondary)
      );
    }
    
    return row;
  }

  static link(label, url, emoji = null) {
    const button = new ButtonBuilder()
      .setLabel(label)
      .setURL(url)
      .setStyle(ButtonStyle.Link);
    
    if (emoji) button.setEmoji(emoji);
    
    return new ActionRowBuilder().addComponents(button);
  }

  static support(inviteUrl, supportUrl) {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel("Invite Bot")
          .setURL(inviteUrl)
          .setStyle(ButtonStyle.Link)
          .setEmoji("🤖"),
        new ButtonBuilder()
          .setLabel("Support Server")
          .setURL(supportUrl)
          .setStyle(ButtonStyle.Link)
          .setEmoji("❓")
      );
  }

  static disableButtons(row) {
    const newRow = new ActionRowBuilder();
    
    for (const component of row.components) {
      newRow.addComponents(
        ButtonBuilder.from(component).setDisabled(true)
      );
    }
    
    return newRow;
  }
}

module.exports = ButtonBuilderUtil;