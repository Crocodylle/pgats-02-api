// test/helpers/enhancedGraphQLHelper.js
const { 
    executeGraphQL,
    registerUserGraphQL,
    loginUserGraphQL,
    getUserProfile,
    getUserBalance,
    getUserTransfers,
    createTransferGraphQL,
    addFavoriteGraphQL,
    getFavoritesGraphQL,
    checkGraphQLHealth
} = require('./graphqlApiHelper');
const FixtureHelper = require('./fixtureHelper');

/**
 * EnhancedGraphQLHelper - Combines GraphQL operations with fixtures
 * Provides advanced GraphQL testing using fixture data
 */
class EnhancedGraphQLHelper {
    /**
     * Execute GraphQL query from fixture
     * @param {string} fixturePath - Path to GraphQL query fixture
     * @param {Object} variables - Query variables
     * @param {string} token - Authentication token
     * @param {Object} overrides - Query overrides
     * @returns {Object} GraphQL response
     */
    static async queryFromFixture(fixturePath, variables = {}, token = null, overrides = {}) {
        const fixture = FixtureHelper.load(fixturePath);
        const queryData = { ...fixture, ...overrides };
        
        const mergedVariables = { ...queryData.variables, ...variables };
        
        return await executeGraphQL(queryData.query, mergedVariables, token);
    }

    /**
     * Test GraphQL operation with fixtures
     * @param {string} queryFixture - Path to query fixture
     * @param {string} responseFixture - Path to expected response fixture
     * @param {Object} variables - Query variables
     * @param {string} token - Authentication token
     * @param {Object} options - Additional options
     * @returns {Object} Test result with comparison data
     */
    static async testGraphQLWithFixtures(queryFixture, responseFixture, variables = {}, token = null, options = {}) {
        // 1. Load fixtures
        const queryData = FixtureHelper.load(queryFixture);
        const expectedResponse = FixtureHelper.load(responseFixture);

        // 2. Execute query
        const mergedVariables = { ...queryData.variables, ...variables };
        const response = await executeGraphQL(queryData.query, mergedVariables, token);

        // 3. Clean and compare
        const fieldsToIgnore = options.fieldsToIgnore || ['id', 'createdAt', 'updatedAt'];
        const cleanedResponse = FixtureHelper.cleanDynamicFields(response.data, fieldsToIgnore);
        const cleanedExpected = FixtureHelper.cleanDynamicFields(expectedResponse, fieldsToIgnore);

        // 4. Check for errors
        const hasErrors = response.data?.errors && response.data.errors.length > 0;
        const expectedErrors = expectedResponse.errors || [];
        const errorsMatch = JSON.stringify(response.data?.errors || []) === JSON.stringify(expectedErrors);

        return {
            response,
            expectedResponse,
            cleanedResponse,
            cleanedExpected,
            matches: FixtureHelper.compareIgnoringFields(response.data, expectedResponse, fieldsToIgnore),
            hasErrors,
            errorsMatch,
            statusMatches: response.status === (options.expectedStatus || 200)
        };
    }

    /**
     * Register user using GraphQL fixture
     * @param {string} fixturePath - Path to registration mutation fixture
     * @param {Object} overrides - User data overrides
     * @returns {Object} Registration result with user and token
     */
    static async registerUserWithFixture(fixturePath, overrides = {}) {
        const fixture = FixtureHelper.load(fixturePath);
        const userData = FixtureHelper.generateUniqueFromTemplate(
            fixture.userDataTemplate || 'request/users/ValidUser.json',
            overrides
        );

        const response = await registerUserGraphQL(userData);
        
        return {
            response,
            userData,
            user: response.data?.data?.register?.user,
            token: response.data?.data?.register?.token
        };
    }

    /**
     * Login user using GraphQL fixture
     * @param {string} fixturePath - Path to login mutation fixture
     * @param {Object} overrides - Credential overrides
     * @returns {Object} Login result with token
     */
    static async loginUserWithFixture(fixturePath, overrides = {}) {
        const credentials = FixtureHelper.mergeWithOverrides(fixturePath, overrides);
        const response = await loginUserGraphQL(credentials);
        
        return {
            response,
            credentials,
            token: response.data?.data?.login?.token,
            user: response.data?.data?.login?.user
        };
    }

    /**
     * Test multiple GraphQL scenarios from fixture
     * @param {string} scenariosFixture - Path to scenarios fixture
     * @param {Object} context - Test context (tokens, users, etc.)
     * @returns {Array<Object>} Array of test results
     */
    static async testMultipleScenarios(scenariosFixture, context = {}) {
        const scenarios = FixtureHelper.load(scenariosFixture);
        const results = [];

        for (const scenario of scenarios) {
            try {
                // Process template variables
                const processedScenario = this._processScenarioTemplate(scenario, context);
                
                const result = await this.testGraphQLWithFixtures(
                    processedScenario.queryFixture,
                    processedScenario.responseFixture,
                    processedScenario.variables || {},
                    processedScenario.token || context.defaultToken,
                    processedScenario.options || {}
                );

                results.push({
                    name: scenario.name,
                    success: result.matches && result.statusMatches && result.errorsMatch,
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
     * Test GraphQL query with various input scenarios
     * @param {string} baseQueryFixture - Path to base query fixture
     * @param {string} scenariosFixture - Path to test scenarios
     * @param {string} token - Authentication token
     * @returns {Object} Comprehensive test results
     */
    static async testQueryScenarios(baseQueryFixture, scenariosFixture, token = null) {
        const baseQuery = FixtureHelper.load(baseQueryFixture);
        const scenarios = FixtureHelper.load(scenariosFixture);
        
        const results = {
            query: baseQuery.query,
            totalTests: scenarios.length,
            passed: 0,
            failed: 0,
            results: []
        };

        for (const scenario of scenarios) {
            try {
                const variables = { ...baseQuery.variables, ...scenario.variables };
                const response = await executeGraphQL(baseQuery.query, variables, token);

                const expectedStatus = scenario.expectedStatus || 200;
                const statusMatches = response.status === expectedStatus;

                let responseMatches = true;
                let errorsMatch = true;

                if (scenario.expectedResponse) {
                    responseMatches = FixtureHelper.compareIgnoringFields(
                        response.data,
                        scenario.expectedResponse,
                        scenario.fieldsToIgnore
                    );
                }

                if (scenario.expectedErrors) {
                    errorsMatch = JSON.stringify(response.data?.errors || []) === 
                                 JSON.stringify(scenario.expectedErrors);
                }

                const testPassed = statusMatches && responseMatches && errorsMatch;
                if (testPassed) results.passed++;
                else results.failed++;

                results.results.push({
                    name: scenario.name,
                    passed: testPassed,
                    statusMatches,
                    responseMatches,
                    errorsMatch,
                    actualStatus: response.status,
                    expectedStatus,
                    response: response.data,
                    variables
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
     * Perform complete GraphQL user journey test
     * @param {string} journeyFixturePath - Path to user journey fixture
     * @returns {Object} Complete journey test results
     */
    static async testGraphQLUserJourney(journeyFixturePath) {
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
                            step.queryFixture,
                            step.overrides
                        );
                        response = registerResult.response;
                        stepContext = { 
                            user: registerResult.user, 
                            token: registerResult.token 
                        };
                        break;

                    case 'login':
                        const loginResult = await this.loginUserWithFixture(
                            step.queryFixture,
                            step.overrides
                        );
                        response = loginResult.response;
                        stepContext = { 
                            token: loginResult.token, 
                            user: loginResult.user 
                        };
                        break;

                    case 'query':
                    case 'mutation':
                        response = await this.queryFromFixture(
                            step.queryFixture,
                            step.variables || {},
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
                const stepSuccess = response.status === (step.expectedStatus || 200) &&
                                  (!response.data?.errors || response.data.errors.length === 0);
                
                if (!stepSuccess) journeyResults.success = false;

                journeyResults.steps.push({
                    name: step.name,
                    type: step.type,
                    success: stepSuccess,
                    response: response.data,
                    status: response.status,
                    expectedStatus: step.expectedStatus || 200,
                    errors: response.data?.errors || []
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
     * Test GraphQL schema validation using fixtures
     * @param {string} schemaTestsFixture - Path to schema validation tests
     * @returns {Object} Schema validation results
     */
    static async testSchemaValidation(schemaTestsFixture) {
        const schemaTests = FixtureHelper.load(schemaTestsFixture);
        const results = {
            totalTests: schemaTests.length,
            passed: 0,
            failed: 0,
            results: []
        };

        for (const test of schemaTests) {
            try {
                const response = await executeGraphQL(test.query, test.variables || {});
                
                const hasExpectedErrors = test.shouldFail || false;
                const actuallyFailed = response.data?.errors && response.data.errors.length > 0;
                
                const testPassed = hasExpectedErrors === actuallyFailed;
                if (testPassed) results.passed++;
                else results.failed++;

                results.results.push({
                    name: test.name,
                    query: test.query,
                    variables: test.variables,
                    shouldFail: hasExpectedErrors,
                    actuallyFailed,
                    passed: testPassed,
                    errors: response.data?.errors || [],
                    response: response.data
                });

            } catch (error) {
                results.failed++;
                results.results.push({
                    name: test.name,
                    passed: false,
                    error: error.message
                });
            }
        }

        return results;
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

    /**
     * Batch test GraphQL operations with performance tracking
     * @param {Array<Object>} operations - Array of GraphQL operations to test
     * @param {Object} options - Test options
     * @returns {Object} Performance and correctness results
     */
    static async batchTestWithPerformance(operations, options = {}) {
        const results = {
            totalOperations: operations.length,
            successful: 0,
            failed: 0,
            averageResponseTime: 0,
            operations: []
        };

        const startTime = Date.now();

        for (const operation of operations) {
            const operationStart = Date.now();
            
            try {
                const response = await this.queryFromFixture(
                    operation.queryFixture,
                    operation.variables || {},
                    operation.token,
                    operation.overrides
                );

                const operationTime = Date.now() - operationStart;
                const success = response.status === 200 && 
                               (!response.data?.errors || response.data.errors.length === 0);

                if (success) results.successful++;
                else results.failed++;

                results.operations.push({
                    name: operation.name,
                    success,
                    responseTime: operationTime,
                    response: response.data
                });

            } catch (error) {
                results.failed++;
                results.operations.push({
                    name: operation.name,
                    success: false,
                    responseTime: Date.now() - operationStart,
                    error: error.message
                });
            }
        }

        const totalTime = Date.now() - startTime;
        results.averageResponseTime = totalTime / operations.length;
        results.totalTime = totalTime;

        return results;
    }
}

module.exports = EnhancedGraphQLHelper;

