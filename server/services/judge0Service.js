const axios = require('axios');

const LANGUAGE_IDS = {
    javascript: 63,  // Node.js
    python: 71,      // Python 3
    java: 62,        // Java
    cpp: 54          // C++ (GCC)
};

const submitCode = async (code, language, stdin = '') => {
    try {
        const languageId = LANGUAGE_IDS[language];
        if (!languageId) throw new Error(`Unsupported language: ${language}`);

        // Create submission
        const createResponse = await axios.post(
            'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false',
            {
                source_code: Buffer.from(code).toString('base64'),
                language_id: languageId,
                stdin: Buffer.from(stdin).toString('base64'),
                cpu_time_limit: 5,
                memory_limit: 128000
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                    'X-RapidAPI-Host': process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com'
                }
            }
        );

        const token = createResponse.data.token;

        // Poll for result
        let result = null;
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const statusResponse = await axios.get(
                `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
                {
                    headers: {
                        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                        'X-RapidAPI-Host': process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com'
                    }
                }
            );

            const status = statusResponse.data.status;
            // Status ids: 1=In Queue, 2=Processing, 3=Accepted, ...
            if (status.id > 2) {
                result = {
                    status: status.description,
                    stdout: statusResponse.data.stdout
                        ? Buffer.from(statusResponse.data.stdout, 'base64').toString()
                        : '',
                    stderr: statusResponse.data.stderr
                        ? Buffer.from(statusResponse.data.stderr, 'base64').toString()
                        : '',
                    compile_output: statusResponse.data.compile_output
                        ? Buffer.from(statusResponse.data.compile_output, 'base64').toString()
                        : '',
                    time: statusResponse.data.time,
                    memory: statusResponse.data.memory
                };
                break;
            }
        }

        if (!result) {
            throw new Error('Code execution timed out');
        }

        return result;
    } catch (error) {
        console.error('Judge0 error:', error.message);
        throw error;
    }
};

const runTestCases = async (code, language, testCases) => {
    const results = [];

    for (const testCase of testCases) {
        try {
            const result = await submitCode(code, language, testCase.input);
            const actualOutput = result.stdout.trim();
            const expectedOutput = testCase.expectedOutput.trim();
            const passed = actualOutput === expectedOutput;

            results.push({
                input: testCase.input,
                expectedOutput: expectedOutput,
                actualOutput: actualOutput,
                passed,
                hidden: testCase.hidden || false,
                status: result.status,
                time: result.time,
                error: result.stderr || result.compile_output || ''
            });
        } catch (err) {
            results.push({
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: '',
                passed: false,
                hidden: testCase.hidden || false,
                status: 'Error',
                error: err.message
            });
        }
    }

    return results;
};

module.exports = { submitCode, runTestCases, LANGUAGE_IDS };
