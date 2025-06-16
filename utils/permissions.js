/**
 * Checks if a user has permission to use a command
 * @param {string} userId - Discord user ID
 * @param {string} permissionType - Type of permission to check
 * @returns {boolean} - Whether the user has permission
 */
function hasPermission(userId, permissionType) {
  if (!process.env[permissionType]) return false

  const allowedUsers = process.env[permissionType].split(",")
  return allowedUsers.includes(userId)
}

/**
 * Checks if a guild is allowed to use the bot
 * @param {string} guildId - Discord guild ID
 * @returns {boolean} - Whether the guild is allowed
 */
function isGuildAllowed(guildId) {
  if (!process.env.ALLOWED_GUILDS) return false

  const allowedGuilds = process.env.ALLOWED_GUILDS.split(",")
  return allowedGuilds.includes(guildId)
}

/**
 * Checks if a user has a specific role
 * @param {Object} member - Discord guild member
 * @param {string} roleType - Type of role to check
 * @returns {boolean} - Whether the user has the role
 */
function hasRole(member, roleType) {
  if (!process.env[roleType]) return false

  const roleIds = process.env[roleType].split(",")
  return member.roles.cache.some((role) => roleIds.includes(role.id))
}

module.exports = {
  hasPermission,
  isGuildAllowed,
  hasRole,
}
