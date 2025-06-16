module.exports = {
  // Bot configuration
  prefix: "!",

  // Channel IDs
  channels: {
    notification: process.env.NOTIFICATION_CHANNEL_ID,
    logs: process.env.LOGS_CHANNEL_ID,
  },

  // Webhook URLs
  webhooks: {
    hardlogout: process.env.HARDLOGOUT_WEBHOOK_URL,
    giveaway: process.env.GIVEAWAY_WEBHOOK_URL,
    vip: process.env.VIP_WEBHOOK_URL,
  },

  // Cooldowns
  cooldowns: {
    gacha: 2000, // 2 seconds
    daily: 86400000, // 24 hours
  },

  // Limits
  limits: {
    gacha: {
      max: 10,
      resetTime: 600000, // 10 minutes
    },
  },
}
