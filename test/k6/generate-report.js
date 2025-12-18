/**
 * Script para gerar relatório HTML a partir dos resultados do K6
 * 
 * Uso:
 * 1. Execute o teste K6 gerando JSON:
 *    k6 run test/k6/tests/banking-api.test.js --out json=test/k6/results.json
 * 
 * 2. Execute este script:
 *    node test/k6/generate-report.js
 */

const fs = require('fs');
const path = require('path');

// Configurações
const RESULTS_FILE = path.join(__dirname, 'results.json');
const SUMMARY_FILE = path.join(__dirname, 'summary.json');
const REPORT_FILE = path.join(__dirname, 'report.html');

/**
 * Lê e processa o arquivo de resultados JSON do K6
 */
function readResults() {
    if (fs.existsSync(SUMMARY_FILE)) {
        const content = fs.readFileSync(SUMMARY_FILE, 'utf8');
        return JSON.parse(content);
    }
    
    if (fs.existsSync(RESULTS_FILE)) {
        const lines = fs.readFileSync(RESULTS_FILE, 'utf8').split('\n').filter(l => l.trim());
        const metrics = {};
        
        lines.forEach(line => {
            try {
                const data = JSON.parse(line);
                if (data.type === 'Point' && data.metric) {
                    if (!metrics[data.metric]) {
                        metrics[data.metric] = [];
                    }
                    metrics[data.metric].push(data.data.value);
                }
            } catch (e) {
                // Ignora linhas inválidas
            }
        });
        
        return metrics;
    }
    
    return null;
}

/**
 * Calcula estatísticas de um array de valores
 */
function calculateStats(values) {
    if (!values || values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
        count: values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: sum / values.length,
        med: sorted[Math.floor(sorted.length / 2)],
        p90: sorted[Math.floor(sorted.length * 0.9)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
    };
}

/**
 * Gera o relatório HTML
 */
function generateHTML(data) {
    const timestamp = new Date().toLocaleString('pt-BR');
    
    let metricsHTML = '';
    
    if (data && typeof data === 'object') {
        Object.keys(data).forEach(metricName => {
            const values = data[metricName];
            if (Array.isArray(values) && values.length > 0) {
                const stats = calculateStats(values);
                if (stats) {
                    metricsHTML += `
                    <tr>
                        <td><strong>${metricName}</strong></td>
                        <td>${stats.count}</td>
                        <td>${stats.avg.toFixed(2)}</td>
                        <td>${stats.min.toFixed(2)}</td>
                        <td>${stats.max.toFixed(2)}</td>
                        <td>${stats.p95.toFixed(2)}</td>
                        <td>${stats.p99.toFixed(2)}</td>
                    </tr>`;
                }
            }
        });
    }

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K6 Performance Test Report - Banking API</title>
    <style>
        :root {
            --primary: #7c3aed;
            --primary-light: #a78bfa;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --bg: #0f172a;
            --bg-card: #1e293b;
            --text: #e2e8f0;
            --text-muted: #94a3b8;
            --border: #334155;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 2rem;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
            border-radius: 1rem;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            color: rgba(255,255,255,0.8);
            font-size: 1.1rem;
        }
        
        .timestamp {
            margin-top: 1rem;
            font-size: 0.9rem;
            opacity: 0.7;
        }
        
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: var(--bg-card);
            border-radius: 0.75rem;
            padding: 1.5rem;
            border: 1px solid var(--border);
        }
        
        .card-title {
            color: var(--text-muted);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }
        
        .card-value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-light);
        }
        
        .card.success .card-value { color: var(--success); }
        .card.warning .card-value { color: var(--warning); }
        .card.danger .card-value { color: var(--danger); }
        
        section {
            background: var(--bg-card);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid var(--border);
        }
        
        h2 {
            color: var(--primary-light);
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--border);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }
        
        th {
            background: rgba(124, 58, 237, 0.1);
            color: var(--primary-light);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
        }
        
        tr:hover {
            background: rgba(255,255,255,0.02);
        }
        
        .concept-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .concept-item {
            padding: 1rem;
            background: rgba(124, 58, 237, 0.1);
            border-radius: 0.5rem;
            border-left: 3px solid var(--primary);
        }
        
        .concept-item strong {
            color: var(--primary-light);
        }
        
        footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
            font-size: 0.875rem;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .badge-success { background: rgba(16, 185, 129, 0.2); color: var(--success); }
        .badge-warning { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
        .badge-danger { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🚀 K6 Performance Test Report</h1>
            <p class="subtitle">Banking API - Teste de Performance</p>
            <p class="timestamp">Gerado em: ${timestamp}</p>
        </header>
        
        <section>
            <h2>📊 Conceitos Demonstrados</h2>
            <div class="concept-list">
                <div class="concept-item"><strong>✓ Thresholds</strong> - Limites de performance</div>
                <div class="concept-item"><strong>✓ Checks</strong> - Validações de resposta</div>
                <div class="concept-item"><strong>✓ Helpers</strong> - Funções reutilizáveis</div>
                <div class="concept-item"><strong>✓ Trends</strong> - Métricas customizadas</div>
                <div class="concept-item"><strong>✓ Faker</strong> - Geração de dados</div>
                <div class="concept-item"><strong>✓ Env Vars</strong> - Variáveis de ambiente</div>
                <div class="concept-item"><strong>✓ Stages</strong> - Fases de carga</div>
                <div class="concept-item"><strong>✓ Reaproveitamento</strong> - Reuso de respostas</div>
                <div class="concept-item"><strong>✓ JWT Token</strong> - Autenticação</div>
                <div class="concept-item"><strong>✓ Data-Driven</strong> - Dados externos</div>
                <div class="concept-item"><strong>✓ Groups</strong> - Agrupamento lógico</div>
            </div>
        </section>
        
        <section>
            <h2>📈 Métricas de Performance</h2>
            ${metricsHTML ? `
            <table>
                <thead>
                    <tr>
                        <th>Métrica</th>
                        <th>Count</th>
                        <th>Avg</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>P95</th>
                        <th>P99</th>
                    </tr>
                </thead>
                <tbody>
                    ${metricsHTML}
                </tbody>
            </table>
            ` : `
            <p style="text-align: center; padding: 2rem; color: var(--text-muted);">
                Execute o teste K6 para gerar métricas.<br><br>
                <code style="background: var(--bg); padding: 0.5rem 1rem; border-radius: 0.25rem;">
                    k6 run test/k6/tests/banking-api.test.js --out json=test/k6/results.json
                </code>
            </p>
            `}
        </section>
        
        <section>
            <h2>🎯 Thresholds Configurados</h2>
            <table>
                <thead>
                    <tr>
                        <th>Métrica</th>
                        <th>Limite</th>
                        <th>Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>http_req_duration</td>
                        <td>p(95) < 500ms</td>
                        <td>95% das requisições devem completar em menos de 500ms</td>
                    </tr>
                    <tr>
                        <td>http_req_failed</td>
                        <td>rate < 1%</td>
                        <td>Menos de 1% de requisições podem falhar</td>
                    </tr>
                    <tr>
                        <td>checks</td>
                        <td>rate > 95%</td>
                        <td>Pelo menos 95% das validações devem passar</td>
                    </tr>
                    <tr>
                        <td>login_duration</td>
                        <td>p(95) < 600ms</td>
                        <td>Login deve ser rápido</td>
                    </tr>
                    <tr>
                        <td>transfer_duration</td>
                        <td>p(95) < 700ms</td>
                        <td>Transferências dentro do SLA</td>
                    </tr>
                </tbody>
            </table>
        </section>
        
        <section>
            <h2>📋 Stages (Fases de Carga)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Fase</th>
                        <th>Duração</th>
                        <th>VUs</th>
                        <th>Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Ramp-up</td>
                        <td>30s</td>
                        <td>0 → 10</td>
                        <td>Aumento gradual de usuários</td>
                    </tr>
                    <tr>
                        <td>Sustentado</td>
                        <td>1m</td>
                        <td>10</td>
                        <td>Carga constante</td>
                    </tr>
                    <tr>
                        <td>Stress</td>
                        <td>30s</td>
                        <td>20</td>
                        <td>Pico de carga (2x)</td>
                    </tr>
                    <tr>
                        <td>Ramp-down</td>
                        <td>30s</td>
                        <td>20 → 0</td>
                        <td>Redução gradual</td>
                    </tr>
                </tbody>
            </table>
        </section>
        
        <footer>
            <p>PGATS-02 - Testes de Performance com K6</p>
            <p>Banking API Performance Test Suite</p>
        </footer>
    </div>
</body>
</html>`;

    return html;
}

/**
 * Função principal
 */
function main() {
    console.log('🔄 Gerando relatório HTML...\n');
    
    const data = readResults();
    const html = generateHTML(data);
    
    fs.writeFileSync(REPORT_FILE, html);
    
    console.log(`✅ Relatório gerado: ${REPORT_FILE}`);
    console.log('\n📊 Para gerar com métricas completas:');
    console.log('   1. Execute: k6 run test/k6/tests/banking-api.test.js --out json=test/k6/results.json');
    console.log('   2. Execute: node test/k6/generate-report.js');
}

main();

