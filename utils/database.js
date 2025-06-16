const sql = require("mssql");
require("dotenv").config(); // ⬅️ HARUS di paling atas!

const dbConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  port: parseInt(process.env.SQL_PORT),
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

/**
 * Connects to the database and executes a query
 * @param {Object} dbConfig - Database configuration
 * @param {Function} callback - Function to execute with the pool
 * @returns {Promise<*>} - Result of the callback
 */
async function withDatabase(dbConfig, callback) {
  let pool
  try {
    pool = await sql.connect(dbConfig)
    return await callback(pool)
  } catch (error) {
    console.error("Database error:", error)
    throw error
  } finally {
    if (pool) {
      pool.close()
    }
  }
}

/**
 * Splits a message into chunks of specified size
 * @param {string} message - Message to split
 * @param {number} maxLength - Maximum length of each chunk
 * @returns {string[]} - Array of message chunks
 */
function splitMessage(message, maxLength = 4000) {
  const messages = []
  while (message.length > maxLength) {
    const chunk = message.slice(0, maxLength)
    messages.push(chunk)
    message = message.slice(maxLength)
  }
  if (message.length > 0) {
    messages.push(message)
  }
  return messages
}

/**
 * Formats a date in a readable format
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }
  return new Date(date).toLocaleString("id-ID", options).replace(",", "")
}

module.exports = {
  dbConfig,
  withDatabase,
  splitMessage,
  formatDate,
}
