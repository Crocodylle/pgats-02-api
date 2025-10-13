// test/helpers/enhancedDataHelper.js
const { 
    createTestUser, 
    createMultipleTestUsers, 
    createUserWithBalance,
    createRichUser,
    createPoorUser,
    getValidTransferData,
    getInvalidTransferData,
    clearDatabase 
} = require('./dataHelper');
const { createTestToken } = require('./authHelper');
const FixtureHelper = require('./fixtureHelper');

/**
 * EnhancedDataHelper - Combines dataHelper functionality with fixtures
 * Provides advanced data creation and management using fixture templates
 */
class EnhancedDataHelper {
    /**
     * Create user from fixture template
     * @param {string} fixturePath - Path to user fixture
     * @param {Object} overrides - Fields to override
     * @returns {Object} Created user with token
     */
    static async createUserFromFixture(fixturePath, overrides = {}) {
        const fixtureData = FixtureHelper.load(fixturePath);
        const userData = { ...fixtureData, ...overrides };
        
        // Ensure unique email if not provided in overrides
        if (!overrides.email) {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 100000);
            const uniqueId = Math.random().toString(36).substring(2, 8);
            userData.email = `user${timestamp}${random}${uniqueId}@email.com`;
        }
        
        const user = await createTestUser(userData);
        const token = createTestToken(user.id, user.email, user.account);
        
        return { user, token, originalPassword: userData.password };
    }

    /**
     * Create multiple users from fixture template
     * @param {string} fixturePath - Path to user fixture template
     * @param {number} count - Number of users to create
     * @param {Array<Object>} overridesArray - Array of overrides for each user
     * @returns {Array<Object>} Array of created users with tokens
     */
    static async createUsersFromFixture(fixturePath, count = 2, overridesArray = []) {
        const fixtureData = FixtureHelper.load(fixturePath);
        const users = [];
        
        for (let i = 0; i < count; i++) {
            const overrides = overridesArray[i] || {};
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 100000);
            const uniqueId = Math.random().toString(36).substring(2, 8);
            const userData = {
                ...fixtureData,
                name: overrides.name || `${fixtureData.name} ${i + 1}`,
                email: overrides.email || `user${i + 1}.${timestamp}.${random}.${uniqueId}@email.com`,
                ...overrides
            };
            
            const user = await createTestUser(userData);
            const token = createTestToken(user.id, user.email, user.account);
            
            users.push({ user, token, originalPassword: userData.password });
        }
        
        return users;
    }

    /**
     * Create user with specific balance from fixture
     * @param {string} fixturePath - Path to user fixture
     * @param {number} balance - Desired balance
     * @param {Object} overrides - Additional overrides
     * @returns {Object} Created user with token and specified balance
     */
    static async createUserWithBalanceFromFixture(fixturePath, balance, overrides = {}) {
        // Ensure unique email for balance users
        if (!overrides.email) {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000000);
            const uniqueId = Math.random().toString(36).substring(2, 12);
            overrides.email = `balance${timestamp}${random}${uniqueId}@email.com`;
        }
        
        const { user, token, originalPassword } = await this.createUserFromFixture(fixturePath, overrides);
        
        // Update balance directly in database instead of creating new user
        const { database } = require('../../src/database');
        const userInDb = database.users.find(u => u.id === user.id);
        if (userInDb) {
            userInDb.balance = balance;
            userInDb.updatedAt = new Date();
        }
        
        const updatedUser = { ...user, balance };
        
        return { 
            user: updatedUser, 
            token: createTestToken(updatedUser.id, updatedUser.email, updatedUser.account), 
            originalPassword 
        };
    }

    /**
     * Create complete test scenario from fixture
     * @param {string} scenarioPath - Path to scenario fixture
     * @returns {Object} Complete scenario with users, tokens, and setup data
     */
    static async createScenarioFromFixture(scenarioPath) {
        const scenario = FixtureHelper.load(scenarioPath);
        const result = {
            name: scenario.name || 'Test Scenario',
            users: [],
            tokens: [],
            relationships: {}
        };

        // Create users
        if (scenario.users) {
            for (const userData of scenario.users) {
                const { user, token, originalPassword } = await this.createUserFromFixture(
                    userData.template || 'request/users/ValidUser.json',
                    userData.overrides || {}
                );
                
                // Set specific balance if provided
                if (userData.balance !== undefined) {
                    const userWithBalance = await createUserWithBalance(userData.balance, user);
                    result.users.push({ ...userWithBalance, originalPassword });
                    result.tokens.push(createTestToken(userWithBalance.id, userWithBalance.email, userWithBalance.account));
                } else {
                    result.users.push({ ...user, originalPassword });
                    result.tokens.push(token);
                }
            }
        }

        // Set up relationships (favorites, etc.)
        if (scenario.favorites && result.users.length > 1) {
            result.relationships.favorites = scenario.favorites.map(fav => ({
                userId: result.users[fav.userIndex].id,
                favoriteAccount: result.users[fav.favoriteUserIndex].account
            }));
        }

        // Add any additional setup data
        if (scenario.additionalData) {
            result.additionalData = scenario.additionalData;
        }

        return result;
    }

    /**
     * Create transfer data from fixture with user accounts
     * @param {string} fixturePath - Path to transfer fixture
     * @param {Object} fromUser - Sender user object
     * @param {Object} toUser - Recipient user object
     * @param {Object} overrides - Additional overrides
     * @returns {Object} Transfer data ready for API call
     */
    static createTransferFromFixture(fixturePath, fromUser, toUser, overrides = {}) {
        const fixtureData = FixtureHelper.load(fixturePath);
        return {
            ...fixtureData,
            fromAccount: fromUser.account,
            toAccount: toUser.account,
            ...overrides
        };
    }

    /**
     * Create multiple test users with predefined roles
     * @param {string} rolesFixturePath - Path to roles fixture
     * @returns {Object} Users organized by roles
     */
    static async createUsersByRoles(rolesFixturePath) {
        const rolesData = FixtureHelper.load(rolesFixturePath);
        const usersByRole = {};

        for (const [roleName, roleConfig] of Object.entries(rolesData)) {
            const users = await this.createUsersFromFixture(
                roleConfig.template,
                roleConfig.count || 1,
                roleConfig.overrides || []
            );
            
            usersByRole[roleName] = roleConfig.count === 1 ? users[0] : users;
        }

        return usersByRole;
    }

    /**
     * Generate test data variations from fixture template
     * @param {string} fixturePath - Path to base fixture
     * @param {Array<Object>} variations - Array of variation configs
     * @returns {Array<Object>} Array of test data variations
     */
    static generateVariationsFromFixture(fixturePath, variations) {
        const baseData = FixtureHelper.load(fixturePath);
        
        return variations.map(variation => ({
            name: variation.name,
            data: { ...baseData, ...variation.overrides },
            expectedResult: variation.expectedResult
        }));
    }

    /**
     * Create users for boundary testing (edge cases)
     * @param {string} boundaryFixturePath - Path to boundary test fixture
     * @returns {Object} Users for boundary testing
     */
    static async createBoundaryTestUsers(boundaryFixturePath) {
        const boundaryConfig = FixtureHelper.load(boundaryFixturePath);
        const boundaryUsers = {};

        // Create users with minimum values
        if (boundaryConfig.minimum) {
            boundaryUsers.minimum = await this.createUserWithBalanceFromFixture(
                boundaryConfig.minimum.template,
                boundaryConfig.minimum.balance,
                boundaryConfig.minimum.overrides
            );
        }

        // Create users with maximum values
        if (boundaryConfig.maximum) {
            boundaryUsers.maximum = await this.createUserWithBalanceFromFixture(
                boundaryConfig.maximum.template,
                boundaryConfig.maximum.balance,
                boundaryConfig.maximum.overrides
            );
        }

        // Create users with edge case values
        if (boundaryConfig.edgeCases) {
            boundaryUsers.edgeCases = [];
            for (const edgeCase of boundaryConfig.edgeCases) {
                const user = await this.createUserWithBalanceFromFixture(
                    edgeCase.template,
                    edgeCase.balance,
                    edgeCase.overrides
                );
                boundaryUsers.edgeCases.push({ ...user, testCase: edgeCase.name });
            }
        }

        return boundaryUsers;
    }

    /**
     * Clean up test data and reset database
     * @param {Object} options - Cleanup options
     */
    static async cleanup(options = {}) {
        if (options.clearDatabase !== false) {
            clearDatabase();
        }
        
        // Add any additional cleanup logic here
        if (options.customCleanup && typeof options.customCleanup === 'function') {
            await options.customCleanup();
        }
    }
}

module.exports = EnhancedDataHelper;
