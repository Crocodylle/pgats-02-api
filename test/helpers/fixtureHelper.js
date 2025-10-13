// test/helpers/fixtureHelper.js
const path = require('path');
const fs = require('fs');

/**
 * FixtureHelper - Utility class for managing test fixtures
 * Handles loading, processing, and manipulating fixture data
 */
class FixtureHelper {
    /**
     * Load a fixture file
     * @param {string} fixturePath - Path relative to fixtures directory
     * @returns {Object} Parsed fixture data
     */
    static load(fixturePath) {
        const fullPath = path.join(__dirname, '../fixtures', fixturePath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Fixture not found: ${fixturePath}`);
        }
        return require(fullPath);
    }

    /**
     * Load fixture with dynamic replacements using template variables
     * @param {string} fixturePath - Path to fixture file
     * @param {Object} replacements - Key-value pairs for template replacement
     * @returns {Object} Fixture with replaced values
     */
    static loadWithReplacements(fixturePath, replacements = {}) {
        let fixture = JSON.stringify(this.load(fixturePath));
        
        Object.entries(replacements).forEach(([key, value]) => {
            fixture = fixture.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        
        return JSON.parse(fixture);
    }

    /**
     * Load multiple fixtures at once
     * @param {Array<string>} fixturePaths - Array of fixture paths
     * @returns {Object} Object with fixture names as keys
     */
    static loadMultiple(fixturePaths) {
        const fixtures = {};
        fixturePaths.forEach(fixturePath => {
            const key = path.basename(fixturePath, '.json');
            fixtures[key] = this.load(fixturePath);
        });
        return fixtures;
    }

    /**
     * Clean dynamic fields from response for comparison
     * @param {Object} obj - Object to clean
     * @param {Array<string>} fieldsToRemove - Fields to remove
     * @returns {Object} Cleaned object
     */
    static cleanDynamicFields(obj, fieldsToRemove = ['id', 'createdAt', 'updatedAt']) {
        const cleaned = JSON.parse(JSON.stringify(obj));
        
        const removeFields = (target) => {
            if (Array.isArray(target)) {
                target.forEach(removeFields);
            } else if (target && typeof target === 'object') {
                fieldsToRemove.forEach(field => delete target[field]);
                Object.values(target).forEach(removeFields);
            }
        };
        
        removeFields(cleaned);
        return cleaned;
    }

    /**
     * Compare two objects ignoring dynamic fields
     * @param {Object} actual - Actual response
     * @param {Object} expected - Expected response
     * @param {Array<string>} fieldsToIgnore - Fields to ignore in comparison
     * @returns {boolean} Whether objects match
     */
    static compareIgnoringFields(actual, expected, fieldsToIgnore = ['id', 'createdAt', 'updatedAt']) {
        const cleanedActual = this.cleanDynamicFields(actual, fieldsToIgnore);
        const cleanedExpected = this.cleanDynamicFields(expected, fieldsToIgnore);
        
        return JSON.stringify(cleanedActual) === JSON.stringify(cleanedExpected);
    }

    /**
     * Merge fixture data with overrides
     * @param {string} fixturePath - Path to base fixture
     * @param {Object} overrides - Data to override
     * @returns {Object} Merged data
     */
    static mergeWithOverrides(fixturePath, overrides = {}) {
        const baseData = this.load(fixturePath);
        return { ...baseData, ...overrides };
    }

    /**
     * Generate unique data based on fixture template
     * @param {string} fixturePath - Path to fixture template
     * @param {Object} uniqueFields - Fields to make unique
     * @returns {Object} Fixture with unique data
     */
    static generateUniqueFromTemplate(fixturePath, uniqueFields = {}) {
        const template = this.load(fixturePath);
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        
        const defaults = {
            email: `user${timestamp}${random}@email.com`,
            account: `${timestamp}${random}`.substr(0, 6),
            name: `Test User ${timestamp}`
        };
        
        return { ...template, ...defaults, ...uniqueFields };
    }

    /**
     * Validate fixture against schema (if joi is available)
     * @param {Object} fixture - Fixture data to validate
     * @param {Object} schema - Joi schema
     * @returns {Object} Validation result
     */
    static validateFixture(fixture, schema) {
        try {
            const joi = require('joi');
            const { error, value } = schema.validate(fixture);
            return { isValid: !error, error, value };
        } catch (e) {
            // Joi not available, skip validation
            return { isValid: true, error: null, value: fixture };
        }
    }
}

module.exports = FixtureHelper;

