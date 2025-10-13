// test/helpers/enhancedRequestHelper.js
const { 
    authenticatedPost, 
    authenticatedGet, 
    authenticatedPut, 
    authenticatedDelete,
    registerUser,
    loginUser,
    createTransfer,
    addFavorite,
    getTransfers,
    getFavorites,
    getUserProfile,
    getUserBalance
} = require('./requestHelper');
const FixtureHelper = require('./fixtureHelper');

/**
 * EnhancedRequestHelper - Combines requestHelper functionality with fixtures
 * Provides advanced HTTP request handling using fixture data
 */
class EnhancedRequestHelper {
    /**
     * Make request using fixture data
     * @param {string} method - HTTP method (get, post, put, delete)
     * @param {string} endpoint - API endpoint
     * @param {string} fixturePath - Path to request fixture
     * @param {string} token - Authentication token
     * @param {Object} overrides - Data to override in fixture
     * @returns {Object} HTTP response
     */
    static async requestWithFixture(method, endpoint, fixturePath, token = null, overrides = {}) {
        const requestData = FixtureHelper.mergeWithOverrides(fixturePath, overrides);
        
        switch (method.toLowerCase()) {
            case 'post':
                return await authenticatedPost(endpoint, requestData, token);
            case 'get':
                return await authenticatedGet(endpoint, token);
            case 'put':
                return await authenticatedPut(endpoint, requestData, token);
            case 'delete':
                return await authenticatedDelete(endpoint, token);
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }
    }

    /**
     * Test endpoint with fixture request and expected response
     * @param {string} method - HTTP method
     * @param {string} endpoint - API endpoint
     * @param {string} requestFixture - Path to request fixture
     * @param {string} responseFixture - Path to expected response fixture
     * @param {string} token - Authentication token
     * @param {Object} options - Additional options
     * @returns {Object} Test result with response and comparison data
     */
    static async testEndpointWithFixtures(method, endpoint, requestFixture, responseFixture, token = null, options = {}) {
        // 1. Load fixtures
        const expectedResponse = FixtureHelper.load(responseFixture);

        // 2. Make request
        const response = await this.requestWithFixture(method, endpoint, requestFixture, token, options.requestOverrides);

        // 3. Clean dynamic fields for comparison
        const fieldsToIgnore = options.fieldsToIgnore || ['id', 'createdAt', 'updatedAt'];
        const cleanedResponse = FixtureHelper.cleanDynamicFields(response.body, fieldsToIgnore);
        const cleanedExpected = FixtureHelper.cleanDynamicFields(expectedResponse, fieldsToIgnore);

        // 4. Compare responses
        const matches = FixtureHelper.compareIgnoringFields(response.body, expectedResponse, fieldsToIgnore);

        return {
            response,
            expectedResponse,
            cleanedResponse,
            cleanedExpected,
            matches,
            statusMatches: response.status === (options.expectedStatus || 200)
        };
    }

    /**
     * Batch test multiple scenarios from fixture
     * @param {string} scenariosFixturePath - Path to scenarios fixture
     * @param {Object} context - Test context (users, tokens, etc.)
     * @returns {Array<Object>} Array of test results
     */
    static async testMultipleScenarios(scenariosFixturePath, context = {}) {
        const scenarios = FixtureHelper.load(scenariosFixturePath);
        const results = [];
        
        for (const scenario of scenarios) {
            try {
                // Replace template variables in scenario
                const processedScenario = this._processScenarioTemplate(scenario, context);
                
                const result = await this.testEndpointWithFixtures(
                    processedScenario.method,
                    processedScenario.endpoint,
                    processedScenario.requestFixture,
                    processedScenario.responseFixture,
                    processedScenario.token || context.defaultToken,
                    processedScenario.options || {}
                );
                
                results.push({
                    name: scenario.name,
                    success: result.matches && result.statusMatches,
                    ...result
                });
            } catch (error) {
                results.push({
                    name: scenario.name,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    /**
     * Register user using fixture data
     * @param {string} fixturePath - Path to user registration fixture
     * @param {Object} overrides - Data to override
     * @returns {Object} Registration response with user and token
     */
    static async registerUserWithFixture(fixturePath, overrides = {}) {
        const userData = FixtureHelper.generateUniqueFromTemplate(fixturePath, overrides);
        const response = await registerUser(userData);
        
        return {
            response,
            userData,
            user: response.body?.data,
            token: response.body?.data?.token || response.body?.token
        };
    }

    /**
     * Login user using fixture credentials
     * @param {string} fixturePath - Path to login fixture
     * @param {Object} overrides - Credential overrides
     * @returns {Object} Login response with token
     */
    static async loginUserWithFixture(fixturePath, overrides = {}) {
        const credentials = FixtureHelper.mergeWithOverrides(fixturePath, overrides);
        const response = await loginUser(credentials.email, credentials.password);
        
        return {
            response,
            credentials,
            token: response.body?.data?.token || response.body?.token,
            user: response.body?.data?.user || response.body?.user
        };
    }

    /**
     * Create transfer using fixture data
     * @param {string} fixturePath - Path to transfer fixture
     * @param {string} token - Authentication token
     * @param {Object} overrides - Transfer data overrides
     * @returns {Object} Transfer response
     */
    static async createTransferWithFixture(fixturePath, token, overrides = {}) {
        const transferData = FixtureHelper.mergeWithOverrides(fixturePath, overrides);
        const response = await createTransfer(token, transferData);
        
        return {
            response,
            transferData,
            transfer: response.body?.data
        };
    }

    /**
     * Test API endpoint with various input scenarios
     * @param {string} endpoint - API endpoint to test
     * @param {string} method - HTTP method
     * @param {string} scenariosFixture - Path to test scenarios fixture
     * @param {string} token - Authentication token
     * @returns {Object} Comprehensive test results
     */
    static async testEndpointScenarios(endpoint, method, scenariosFixture, token = null) {
        const scenarios = FixtureHelper.load(scenariosFixture);
        const results = {
            endpoint,
            method,
            totalTests: scenarios.length,
            passed: 0,
            failed: 0,
            results: []
        };

        for (const scenario of scenarios) {
            try {
                const response = await this.requestWithFixture(
                    method,
                    endpoint,
                    scenario.requestFixture,
                    token,
                    scenario.overrides
                );

                const expectedStatus = scenario.expectedStatus || 200;
                const statusMatches = response.status === expectedStatus;

                let responseMatches = true;
                if (scenario.responseFixture) {
                    const expectedResponse = FixtureHelper.load(scenario.responseFixture);
                    responseMatches = FixtureHelper.compareIgnoringFields(
                        response.body,
                        expectedResponse,
                        scenario.fieldsToIgnore
                    );
                }

                const testPassed = statusMatches && responseMatches;
                if (testPassed) results.passed++;
                else results.failed++;

                results.results.push({
                    name: scenario.name,
                    passed: testPassed,
                    statusMatches,
                    responseMatches,
                    actualStatus: response.status,
                    expectedStatus,
                    response: response.body
                });

            } catch (error) {
                results.failed++;
                results.results.push({
                    name: scenario.name,
                    passed: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Perform complete user journey test using fixtures
     * @param {string} journeyFixturePath - Path to user journey fixture
     * @returns {Object} Complete journey test results
     */
    static async testUserJourney(journeyFixturePath) {
        const journey = FixtureHelper.load(journeyFixturePath);
        const journeyResults = {
            name: journey.name,
            steps: [],
            success: true,
            context: {}
        };

        for (const step of journey.steps) {
            try {
                let response;
                let stepContext = {};

                // Handle different step types
                switch (step.type) {
                    case 'register':
                        const registerResult = await this.registerUserWithFixture(
                            step.requestFixture,
                            step.overrides
                        );
                        response = registerResult.response;
                        stepContext = { user: registerResult.user, token: registerResult.token };
                        break;

                    case 'login':
                        const loginResult = await this.loginUserWithFixture(
                            step.requestFixture,
                            step.overrides
                        );
                        response = loginResult.response;
                        stepContext = { token: loginResult.token, user: loginResult.user };
                        break;

                    case 'request':
                        response = await this.requestWithFixture(
                            step.method,
                            step.endpoint,
                            step.requestFixture,
                            journeyResults.context.token || step.token,
                            step.overrides
                        );
                        break;

                    default:
                        throw new Error(`Unknown step type: ${step.type}`);
                }

                // Update journey context
                journeyResults.context = { ...journeyResults.context, ...stepContext };

                // Validate step result
                const stepSuccess = response.status === (step.expectedStatus || 200);
                if (!stepSuccess) journeyResults.success = false;

                journeyResults.steps.push({
                    name: step.name,
                    type: step.type,
                    success: stepSuccess,
                    response: response.body,
                    status: response.status,
                    expectedStatus: step.expectedStatus || 200
                });

            } catch (error) {
                journeyResults.success = false;
                journeyResults.steps.push({
                    name: step.name,
                    type: step.type,
                    success: false,
                    error: error.message
                });
                break; // Stop journey on error
            }
        }

        return journeyResults;
    }

    /**
     * Process scenario template variables
     * @private
     */
    static _processScenarioTemplate(scenario, context) {
        let processedScenario = JSON.stringify(scenario);
        
        // Replace context variables
        Object.entries(context).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number') {
                processedScenario = processedScenario.replace(
                    new RegExp(`{{${key}}}`, 'g'),
                    value
                );
            }
        });
        
        return JSON.parse(processedScenario);
    }
}

module.exports = EnhancedRequestHelper;

