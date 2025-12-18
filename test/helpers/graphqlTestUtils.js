// test/helpers/graphqlTestUtils.js

/**
 * 🔧 GraphQL Test Utilities
 * 
 * Advanced utilities for GraphQL testing including:
 * - Response validators
 * - Error extractors
 * - Schema validators
 * - Performance testers
 */

const { expect } = require('chai');

/**
 * GraphQL Response Validators
 */
const GraphQLValidators = {
    /**
     * Validate successful GraphQL response
     */
    validateSuccess: (response, dataKey) => {
        expect(response.status).to.equal(200, 'Response status should be 200');
        expect(response.data).to.not.have.property('errors', 'Response should not contain errors');
        expect(response.data).to.have.property('data', 'Response should have data property');
        
        if (dataKey) {
            expect(response.data.data).to.have.property(dataKey, `Response should have ${dataKey} in data`);
            return response.data.data[dataKey];
        }
        
        return response.data.data;
    },

    /**
     * Validate GraphQL error response
     */
    validateError: (response, expectedMessage) => {
        expect(response.status).to.equal(200, 'GraphQL errors still return 200 status');
        expect(response.data).to.have.property('errors', 'Response should contain errors');
        expect(response.data.errors).to.be.an('array', 'Errors should be an array');
        expect(response.data.errors.length).to.be.at.least(1, 'Should have at least one error');
        
        if (expectedMessage) {
            const errorMessage = response.data.errors[0].message;
            expect(errorMessage).to.include(expectedMessage, `Error should include: ${expectedMessage}`);
        }
        
        return response.data.errors;
    },

    /**
     * Validate authentication error
     */
    validateAuthError: (response) => {
        const errors = GraphQLValidators.validateError(response);
        expect(errors[0].message).to.include('autenticado');
        return errors;
    },

    /**
     * Validate validation error (400 status)
     */
    validateValidationError: (response) => {
        expect(response.status).to.equal(400, 'Validation errors should return 400');
        expect(response.data).to.have.property('errors');
        return response.data.errors;
    },

    /**
     * Validate user structure
     */
    validateUserStructure: (user) => {
        expect(user).to.have.property('id');
        expect(user).to.have.property('name');
        expect(user).to.have.property('email');
        expect(user).to.have.property('account');
        expect(user).to.have.property('balance');
        expect(user.account).to.match(/^\d{6}$/, 'Account should be 6 digits');
        expect(user.balance).to.be.a('number');
        return user;
    },

    /**
     * Validate transfer structure
     */
    validateTransferStructure: (transfer) => {
        expect(transfer).to.have.property('id');
        expect(transfer).to.have.property('fromAccount');
        expect(transfer).to.have.property('toAccount');
        expect(transfer).to.have.property('amount');
        expect(transfer).to.have.property('description');
        expect(transfer).to.have.property('status');
        expect(transfer).to.have.property('isFavorite');
        expect(transfer).to.have.property('createdAt');
        expect(transfer.amount).to.be.a('number');
        expect(transfer.isFavorite).to.be.a('boolean');
        return transfer;
    },

    /**
     * Validate favorite structure
     */
    validateFavoriteStructure: (favorite) => {
        expect(favorite).to.have.property('id');
        expect(favorite).to.have.property('account');
        expect(favorite).to.have.property('createdAt');
        expect(favorite.account).to.match(/^\d{6}$/);
        return favorite;
    },

    /**
     * Validate auth payload structure
     */
    validateAuthPayload: (data) => {
        expect(data).to.have.property('token');
        expect(data).to.have.property('user');
        expect(data.token).to.be.a('string');
        expect(data.token.length).to.be.greaterThan(20);
        GraphQLValidators.validateUserStructure(data.user);
        return data;
    }
};

/**
 * GraphQL Error Extractors
 */
const GraphQLErrors = {
    /**
     * Extract error message from response
     */
    getMessage: (response) => {
        if (response.data && response.data.errors && response.data.errors.length > 0) {
            return response.data.errors[0].message;
        }
        return null;
    },

    /**
     * Extract all error messages
     */
    getAllMessages: (response) => {
        if (response.data && response.data.errors) {
            return response.data.errors.map(err => err.message);
        }
        return [];
    },

    /**
     * Check if error contains specific message
     */
    contains: (response, message) => {
        const errorMsg = GraphQLErrors.getMessage(response);
        return errorMsg && errorMsg.includes(message);
    },

    /**
     * Get error extensions (additional error info)
     */
    getExtensions: (response) => {
        if (response.data && response.data.errors && response.data.errors.length > 0) {
            return response.data.errors[0].extensions;
        }
        return null;
    }
};

/**
 * GraphQL Schema Utilities
 */
const GraphQLSchema = {
    /**
     * Get type names from schema
     */
    getTypeNames: (introspectionResponse) => {
        if (introspectionResponse.data && introspectionResponse.data.data) {
            const schema = introspectionResponse.data.data.__schema;
            return schema.types.map(t => t.name);
        }
        return [];
    },

    /**
     * Get field names from a type
     */
    getFieldNames: (typeQueryResponse) => {
        if (typeQueryResponse.data && typeQueryResponse.data.data) {
            const type = typeQueryResponse.data.data.__type;
            if (type && type.fields) {
                return type.fields.map(f => f.name);
            }
        }
        return [];
    },

    /**
     * Create introspection query
     */
    introspectionQuery: () => `
        query IntrospectionQuery {
            __schema {
                types {
                    name
                    kind
                }
                queryType {
                    name
                    fields {
                        name
                    }
                }
                mutationType {
                    name
                    fields {
                        name
                    }
                }
            }
        }
    `,

    /**
     * Create type query
     */
    typeQuery: (typeName) => `
        query TypeQuery {
            __type(name: "${typeName}") {
                name
                kind
                fields {
                    name
                    type {
                        name
                        kind
                    }
                }
            }
        }
    `
};

/**
 * GraphQL Performance Testing
 */
const GraphQLPerformance = {
    /**
     * Measure query execution time
     */
    measureQueryTime: async (executeFunction) => {
        const startTime = Date.now();
        const response = await executeFunction();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        return {
            response,
            duration,
            startTime,
            endTime
        };
    },

    /**
     * Assert query completes within time limit
     */
    assertWithinTimeLimit: async (executeFunction, maxDuration = 1000) => {
        const result = await GraphQLPerformance.measureQueryTime(executeFunction);
        
        expect(result.duration).to.be.below(
            maxDuration,
            `Query should complete in less than ${maxDuration}ms, took ${result.duration}ms`
        );
        
        return result;
    },

    /**
     * Run multiple queries and get average time
     */
    averageExecutionTime: async (executeFunction, iterations = 5) => {
        const durations = [];
        
        for (let i = 0; i < iterations; i++) {
            const result = await GraphQLPerformance.measureQueryTime(executeFunction);
            durations.push(result.duration);
        }
        
        const average = durations.reduce((a, b) => a + b, 0) / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);
        
        return {
            average,
            min,
            max,
            durations
        };
    }
};

/**
 * GraphQL Test Helpers
 */
const GraphQLHelpers = {
    /**
     * Extract data from successful response
     */
    extractData: (response, dataKey) => {
        return GraphQLValidators.validateSuccess(response, dataKey);
    },

    /**
     * Check if response has no errors
     */
    isSuccessful: (response) => {
        return response.status === 200 && 
               !response.data.errors && 
               response.data.data !== undefined;
    },

    /**
     * Check if response has errors
     */
    hasErrors: (response) => {
        return response.data && 
               response.data.errors && 
               response.data.errors.length > 0;
    },

    /**
     * Wait for async operation with timeout
     */
    waitFor: async (condition, timeout = 5000, interval = 100) => {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (await condition()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        
        throw new Error(`Condition not met within ${timeout}ms`);
    },

    /**
     * Retry operation with exponential backoff
     */
    retryWithBackoff: async (operation, maxRetries = 3, baseDelay = 1000) => {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (i < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, i);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    },

    /**
     * Compare two objects ignoring dynamic fields
     */
    compareIgnoringFields: (actual, expected, ignoreFields = ['id', 'createdAt', 'updatedAt']) => {
        const actualFiltered = { ...actual };
        const expectedFiltered = { ...expected };
        
        ignoreFields.forEach(field => {
            delete actualFiltered[field];
            delete expectedFiltered[field];
        });
        
        expect(actualFiltered).to.deep.equal(expectedFiltered);
    }
};

/**
 * GraphQL Matchers - Chai-style assertions
 */
const GraphQLMatchers = {
    /**
     * Assert response is successful
     */
    toBeSuccessful: (response) => {
        GraphQLValidators.validateSuccess(response);
    },

    /**
     * Assert response has error
     */
    toHaveError: (response, message) => {
        GraphQLValidators.validateError(response, message);
    },

    /**
     * Assert response has auth error
     */
    toHaveAuthError: (response) => {
        GraphQLValidators.validateAuthError(response);
    },

    /**
     * Assert data matches structure
     */
    toMatchStructure: (data, validator) => {
        validator(data);
    },

    /**
     * Assert array contains item matching condition
     */
    toContainItem: (array, condition) => {
        expect(array).to.be.an('array');
        const item = array.find(condition);
        expect(item).to.exist;
        return item;
    }
};

module.exports = {
    GraphQLValidators,
    GraphQLErrors,
    GraphQLSchema,
    GraphQLPerformance,
    GraphQLHelpers,
    GraphQLMatchers
};

