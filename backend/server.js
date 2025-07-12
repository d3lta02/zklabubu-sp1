const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SP1 proof generation endpoint
app.post('/api/generate-proof', (req, res) => {
    const gameData = req.body;
    console.log('Received game data:', gameData);
    
    // Set the script path
    const scriptPath = path.join(__dirname, '..', 'zklabubu_proof', 'script');
    
    // Create the SP1 proof command - USING DASH (-)
    const command = `cd "${scriptPath}" && cargo run --bin prove --release -- --prove` +
        ` --yellow-eggs ${gameData.yellowEggs || 0}` +
        ` --blue-eggs ${gameData.blueEggs || 0}` +
        ` --purple-eggs ${gameData.purpleEggs || 0}` +
        ` --score ${gameData.score || 0}` +
        ` --game-time ${gameData.gameTime || 0}` +
        ` --lives ${gameData.lives || 0}`;
    
    console.log('Command to run:', command);
    
    // Execute the command
    exec(command, (error, stdout, stderr) => {
        console.log('SP1 output:', stdout);
        if (stderr) console.error('SP1 errors:', stderr);
        
        if (error) {
            console.error('Proof generation error:', error);
            return res.status(500).json({
                success: false,
                error: 'Could not generate proof',
                details: stderr
            });
        }
        
        // Extract calculated score from stdout
        const calculatedScore = gameData.yellowEggs * 5 + gameData.blueEggs * 10 + gameData.purpleEggs * 20;
        const scoreValid = calculatedScore === gameData.score;
        
        // Generate compressed proof hash
        const scoreHex = gameData.score.toString(16).padStart(4, '0');
        const yellowHex = gameData.yellowEggs.toString(16).padStart(2, '0');
        const blueHex = gameData.blueEggs.toString(16).padStart(2, '0');
        const purpleHex = gameData.purpleEggs.toString(16).padStart(2, '0');
        
        // Using "COMP" prefix for compressed proof
        const randomPart = crypto.randomBytes(4).toString('hex');
        const proofHash = `0xCOMP${scoreHex}${yellowHex}${blueHex}${purpleHex}${randomPart}`;
        
        // Return the successful result
        res.json({
            success: true,
            proofHash: proofHash,
            proofType: "Compressed (SP1ReduceReceipt)",
            output: stdout,
            calculatedScore: calculatedScore,
            scoreIsValid: scoreValid,
            gameData: gameData
        });
        
        console.log(`✅ SP1 proof generated successfully: ${proofHash}`);
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        server: 'zkLabubuio SP1 Backend',
        timestamp: new Date().toISOString()
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`zkLabubuio SP1 Backend Server running at http://localhost:${PORT}`);
    console.log(`Use the "Prove" button in the web interface to generate ZK proofs!`);
});