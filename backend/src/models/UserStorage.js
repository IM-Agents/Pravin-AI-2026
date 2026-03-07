const fs = require('fs').promises;
const path = require('path');

class UserStorage {
  constructor() {
    this.filePath = path.join(__dirname, '../../data/users.json');
    this.initializeStorage();
  }

  /**
   * Initialize the storage file if it doesn't exist
   */
  async initializeStorage() {
    try {
      await fs.access(this.filePath);
    } catch (error) {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
    }
  }

  /**
   * Read all users from storage
   * @returns {Promise<Array>} Array of user objects
   */
  async readUsers() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users:', error);
      return [];
    }
  }

  /**
   * Write users to storage
   * @param {Array} users - Array of user objects
   */
  async writeUsers(users) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error writing users:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data (email, password, name)
   * @returns {Promise<Object>} Created user object (without password)
   */
  async createUser(userData) {
    const users = await this.readUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      password: userData.password,
      name: userData.name || userData.email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await this.writeUsers(users);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findByEmail(email) {
    const users = await this.readUsers();
    return users.find(u => u.email === email) || null;
  }

  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findById(id) {
    const users = await this.readUsers();
    return users.find(u => u.id === id) || null;
  }

  /**
   * Get all users (without passwords)
   * @returns {Promise<Array>} Array of user objects without passwords
   */
  async getAllUsers() {
    const users = await this.readUsers();
    return users.map(({ password, ...user }) => user);
  }
}

module.exports = new UserStorage();

