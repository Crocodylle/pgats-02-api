// test/helpers/testSuite.js
const FixtureHelper = require('./fixtureHelper');
const EnhancedDataHelper = require('./enhancedDataHelper');
const EnhancedRequestHelper = require('./enhancedRequestHelper');
const EnhancedGraphQLHelper = require('./enhancedGraphQLHelper');
const { createTestToken } = require('./authHelper');

/**
 * TestSuite - Master helper that orchestrates complete test scenarios
 * Combines all helpers and fixtures for comprehensive testing
 */
class TestSuite {
    /**
     * Run complete test scenario with fixtures and helpers
     * @param {string} scenarioName - Name of the scenario fixture file
     * @param {Object} options - Additional options
     * @returns {Object} Complete scenario results
     */
    static async runCompleteScenario(scenarioName, options = {}) {
        const scenarioPath = `scenarios/${scenarioName}.json`;
        const scenario = FixtureHelper.load(scenarioPath);
        
        const results = {
            scenarioName,
            name: scenario.name,
            description: scenario.description,
            users: [],
            tokens: [],
            responses: [],
            success: true,
            startTime: Date.now(),
            context: {}
        };

        try {
            // 1. Setup phase - Create users and initial data
            if (scenario.setup) {
                await this._executeSetupPhase(scenario.setup, results);
            }

            // 2. Execution phase - Run test steps
            if (scenario.steps) {
                await this._executeTestSteps(scenario.steps, results);
            }

            // 3. Validation phase - Check results
            if (scenario.validation) {
                await this._executeValidationPhase(scenario.validation, results);
            }

            // 4. Cleanup phase
            if (scenario.cleanup !== false && options.cleanup !== false) {
                await this._executeCleanupPhase(scenario.cleanup, results);
            }

        } catch (error) {
            results.success = false;
            results.error = error.message;
        }

        results.endTime = Date.now();
        results.duration = results.endTime - results.startTime;

        return results;
    }

    /**
     * Run API test suite with comprehensive coverage
     * @param {string} testSuiteFixture - Path to test suite configuration
     * @returns {Object} Complete test suite results
     */
    static async runAPITestSuite(testSuiteFixture) {
        const testSuite = FixtureHelper.load(testSuiteFixture);
        const suiteResults = {
            name: testSuite.name,
            description: testSuite.description,
            totalScenarios: testSuite.scenarios?.length || 0,
            passedScenarios: 0,
            failedScenarios: 0,
            scenarios: [],
            startTime: Date.now()
        };

        // Run each scenario
        for (const scenarioConfig of testSuite.scenarios || []) {
            try {
                const scenarioResult = await this.runCompleteScenario(
                    scenarioConfig.name,
                    scenarioConfig.options || {}
                );

                if (scenarioResult.success) {
                    suiteResults.passedScenarios++;
                } else {
                    suiteResults.failedScenarios++;
                }

                suiteResults.scenarios.push(scenarioResult);

            } catch (error) {
                suiteResults.failedScenarios++;
                suiteResults.scenarios.push({
                    scenarioName: scenarioConfig.name,
                    success: false,
                    error: error.message
                });
            }
        }

        suiteResults.endTime = Date.now();
        suiteResults.duration = suiteResults.endTime - suiteResults.startTime;
        suiteResults.successRate = (suiteResults.passedScenarios / suiteResults.totalScenarios) * 100;

        return suiteResults;
    }

    /**
     * Run performance test scenarios
     * @param {string} performanceFixture - Path to performance test configuration
     * @returns {Object} Performance test results
     */
    static async runPerformanceTests(performanceFixture) {
        const perfConfig = FixtureHelper.load(performanceFixture);
        const results = {
            name: perfConfig.name,
            tests: [],
            summary: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                minResponseTime: Infinity,
                maxResponseTime: 0
            }
        };

        for (const test of perfConfig.tests) {
            const testResult = await this._runPerformanceTest(test);
            results.tests.push(testResult);

            // Update summary
            results.summary.totalRequests += testResult.totalRequests;
            results.summary.successfulRequests += testResult.successfulRequests;
            results.summary.failedRequests += testResult.failedRequests;
            results.summary.minResponseTime = Math.min(results.summary.minResponseTime, testResult.minResponseTime);
            results.summary.maxResponseTime = Math.max(results.summary.maxResponseTime, testResult.maxResponseTime);
        }

        // Calculate overall average
        if (results.summary.totalRequests > 0) {
            const totalTime = results.tests.reduce((sum, test) => sum + test.totalTime, 0);
            results.summary.averageResponseTime = totalTime / results.summary.totalRequests;
        }

        return results;
    }

    /**
     * Run regression test suite
     * @param {string} regressionFixture - Path to regression test configuration
     * @returns {Object} Regression test results
     */
    static async runRegressionTests(regressionFixture) {
        const regressionConfig = FixtureHelper.load(regressionFixture);
        const results = {
            name: regressionConfig.name,
            version: regressionConfig.version,
            baselineVersion: regressionConfig.baselineVersion,
            tests: [],
            regressions: [],
            improvements: []
        };

        for (const test of regressionConfig.tests) {
            const testResult = await this._runRegressionTest(test);
            results.tests.push(testResult);

            // Check for regressions or improvements
            if (testResult.isRegression) {
                results.regressions.push(testResult);
            } else if (testResult.isImprovement) {
                results.improvements.push(testResult);
            }
        }

        results.hasRegressions = results.regressions.length > 0;
        results.summary = {
            totalTests: results.tests.length,
            regressions: results.regressions.length,
            improvements: results.improvements.length,
            stable: results.tests.length - results.regressions.length - results.improvements.length
        };

        return results;
    }

    /**
     * Generate comprehensive test report
     * @param {Array<Object>} testResults - Array of test results
     * @param {Object} options - Report options
     * @returns {Object} Formatted test report
     */
    static generateTestReport(testResults, options = {}) {
        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                successRate: 0,
                totalDuration: 0
            },
            details: [],
            recommendations: []
        };

        // Process results
        testResults.forEach(result => {
            report.summary.totalTests++;
            report.summary.totalDuration += result.duration || 0;

            if (result.success) {
                report.summary.passed++;
            } else {
                report.summary.failed++;
                
                // Add failure details
                report.details.push({
                    test: result.name || result.scenarioName,
                    error: result.error,
                    type: 'failure'
                });
            }
        });

        // Calculate success rate
        if (report.summary.totalTests > 0) {
            report.summary.successRate = (report.summary.passed / report.summary.totalTests) * 100;
        }

        // Generate recommendations
        report.recommendations = this._generateRecommendations(report, testResults);

        return report;
    }

    /**
     * Execute setup phase of scenario
     * @private
     */
    static async _executeSetupPhase(setup, results) {
        // Create users
        if (setup.users) {
            if (setup.users.fromScenario) {
                const scenarioResult = await EnhancedDataHelper.createScenarioFromFixture(setup.users.fixture);
                results.users = scenarioResult.users;
                results.tokens = scenarioResult.tokens;
                results.context = { ...results.context, ...scenarioResult };
            } else if (setup.users.fromFixture) {
                const usersData = await EnhancedDataHelper.createUsersFromFixture(
                    setup.users.fixture,
                    setup.users.count || 2
                );
                results.users = usersData.map(u => u.user);
                results.tokens = usersData.map(u => u.token);
            }
        }

        // Additional setup steps
        if (setup.customSteps) {
            for (const step of setup.customSteps) {
                await this._executeCustomStep(step, results);
            }
        }
    }

    /**
     * Execute test steps
     * @private
     */
    static async _executeTestSteps(steps, results) {
        for (const step of steps) {
            const stepResult = {
                name: step.name,
                type: step.type,
                startTime: Date.now()
            };

            try {
                let response;

                switch (step.type) {
                    case 'rest':
                        response = await EnhancedRequestHelper.requestWithFixture(
                            step.method,
                            step.endpoint,
                            step.requestFixture,
                            this._getTokenForStep(step, results),
                            step.overrides
                        );
                        break;

                    case 'graphql':
                        response = await EnhancedGraphQLHelper.queryFromFixture(
                            step.queryFixture,
                            step.variables || {},
                            this._getTokenForStep(step, results),
                            step.overrides
                        );
                        break;

                    case 'scenario':
                        const scenarioResult = await this.runCompleteScenario(step.scenarioName);
                        response = scenarioResult;
                        break;

                    default:
                        throw new Error(`Unknown step type: ${step.type}`);
                }

                stepResult.success = this._validateStepResponse(response, step);
                stepResult.response = response;

                // Update context with response data
                if (step.saveToContext) {
                    results.context[step.saveToContext] = response;
                }

            } catch (error) {
                stepResult.success = false;
                stepResult.error = error.message;
                results.success = false;
            }

            stepResult.endTime = Date.now();
            stepResult.duration = stepResult.endTime - stepResult.startTime;
            results.responses.push(stepResult);
        }
    }

    /**
     * Execute validation phase
     * @private
     */
    static async _executeValidationPhase(validation, results) {
        for (const check of validation.checks || []) {
            const checkResult = await this._executeValidationCheck(check, results);
            if (!checkResult.success) {
                results.success = false;
            }
            results.responses.push(checkResult);
        }
    }

    /**
     * Execute cleanup phase
     * @private
     */
    static async _executeCleanupPhase(cleanup, results) {
        try {
            await EnhancedDataHelper.cleanup(cleanup || {});
        } catch (error) {
            // Log cleanup error but don't fail the test
            console.warn('Cleanup error:', error.message);
        }
    }

    /**
     * Get token for step execution
     * @private
     */
    static _getTokenForStep(step, results) {
        if (step.token) return step.token;
        if (step.userIndex !== undefined) return results.tokens[step.userIndex];
        return results.tokens[0]; // Default to first user
    }

    /**
     * Validate step response
     * @private
     */
    static _validateStepResponse(response, step) {
        // Check status code
        if (step.expectedStatus && response.status !== step.expectedStatus) {
            return false;
        }

        // Check for errors
        if (step.shouldNotHaveErrors && response.data?.errors) {
            return false;
        }

        // Additional validations can be added here
        return true;
    }

    /**
     * Run performance test
     * @private
     */
    static async _runPerformanceTest(test) {
        const results = {
            name: test.name,
            totalRequests: test.requests || 10,
            successfulRequests: 0,
            failedRequests: 0,
            responseTimes: [],
            minResponseTime: Infinity,
            maxResponseTime: 0,
            totalTime: 0
        };

        const startTime = Date.now();

        for (let i = 0; i < results.totalRequests; i++) {
            const requestStart = Date.now();
            
            try {
                let response;
                if (test.type === 'rest') {
                    response = await EnhancedRequestHelper.requestWithFixture(
                        test.method,
                        test.endpoint,
                        test.requestFixture,
                        test.token
                    );
                } else if (test.type === 'graphql') {
                    response = await EnhancedGraphQLHelper.queryFromFixture(
                        test.queryFixture,
                        test.variables,
                        test.token
                    );
                }

                const responseTime = Date.now() - requestStart;
                results.responseTimes.push(responseTime);
                results.minResponseTime = Math.min(results.minResponseTime, responseTime);
                results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);

                if (response.status === 200) {
                    results.successfulRequests++;
                } else {
                    results.failedRequests++;
                }

            } catch (error) {
                results.failedRequests++;
                const responseTime = Date.now() - requestStart;
                results.responseTimes.push(responseTime);
            }
        }

        results.totalTime = Date.now() - startTime;
        results.averageResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;

        return results;
    }

    /**
     * Generate recommendations based on test results
     * @private
     */
    static _generateRecommendations(report, testResults) {
        const recommendations = [];

        // Success rate recommendations
        if (report.summary.successRate < 90) {
            recommendations.push({
                type: 'quality',
                priority: 'high',
                message: `Success rate is ${report.summary.successRate.toFixed(1)}%. Consider reviewing failed tests.`
            });
        }

        // Performance recommendations
        const avgDuration = report.summary.totalDuration / report.summary.totalTests;
        if (avgDuration > 5000) { // 5 seconds
            recommendations.push({
                type: 'performance',
                priority: 'medium',
                message: `Average test duration is ${avgDuration.toFixed(0)}ms. Consider optimizing slow tests.`
            });
        }

        return recommendations;
    }
}

module.exports = TestSuite;

