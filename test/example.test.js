const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');

const app = require('../app.js');

describe('API Example Tests with Chai', () => {
    describe('Health Check', () => {
        it('should return status 200 for health endpoint', async () => {
            const response = await request(app)
                .get('/health');
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'OK');
            expect(response.body).to.have.property('timestamp');
            expect(response.body).to.have.property('uptime');
        });
    });

    describe('Root Endpoint', () => {
        it('should return API information', async () => {
            const response = await request(app)
                .get('/');
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('version', '1.0.0');
            expect(response.body).to.have.property('endpoints');
            expect(response.body.endpoints).to.be.an('object');
        });
    });

    describe('Authentication', () => {
        it('should return 400 for login without credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({});
            
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error');
        });

        it('should return 400 for login with missing password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@email.com'
                });
            
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error');
        });
    });

    describe('User Registration', () => {
        it('should return 400 for registration without required fields', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({
                    name: 'Test User'
                });
            
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error');
        });
    });

    describe('Protected Routes', () => {
        it('should return 401 for users endpoint without token', async () => {
            const response = await request(app)
                .get('/users');
            
            expect(response.status).to.equal(401);
            expect(response.body).to.have.property('error');
        });

        it('should return 401 for transfers endpoint without token', async () => {
            const response = await request(app)
                .post('/transfers')
                .send({
                    toAccount: '123456',
                    amount: 100
                });
            
            expect(response.status).to.equal(401);
            expect(response.body).to.have.property('error');
        });
    });

    describe('404 Routes', () => {
        it('should return 404 for non-existent route', async () => {
            const response = await request(app)
                .get('/non-existent-route');
            
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('error');
            expect(response.body).to.have.property('path', '/non-existent-route');
            expect(response.body).to.have.property('method', 'GET');
        });
    });
});
